// lib/utils/processExcelUpload.ts
import ExcelJS from "exceljs";
import { Prisma, PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth"; // Your NextAuth config
import {
  excelImportConfig,
  SheetConfig,
  TransformContext,
  PrismaModelName,
  getImportOrder,
  getSheetConfig,
  getForeignKeyConfig,
  OPTIONAL_SHEETS,
  getRequiredSheets,
  isValidId,
} from "@/lib/config/excel-import-config";

/* =========================================================
 * TYPES
 * ========================================================= */

export interface SheetResult {
  sheetName: string;
  model: PrismaModelName;
  status: "success" | "partial" | "failed" | "skipped";
  imported: number;
  duplicates: number;
  skipped: number;
  errors: string[];
  warnings: string[];
}

export interface ImportResult {
  success: boolean;
  totalSheets: number;
  processedSheets: number;
  results: SheetResult[];
  errors: string[];
  summary: {
    totalImported: number;
    totalDuplicates: number;
    totalSkipped: number;
    totalErrors: number;
  };
}

export interface WorkbookValidation {
  valid: boolean;
  found: string[];
  missingRequired: string[];
  missingOptional: string[];
}

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/* =========================================================
 * WORKBOOK VALIDATION
 * ========================================================= */

export function validateWorkbookStructure(
  workbook: ExcelJS.Workbook,
): WorkbookValidation {
  const sheetNames = workbook.worksheets.map((ws) => ws.name);
  const requiredSheets = getRequiredSheets();

  const found = sheetNames.filter((name) =>
    excelImportConfig.some((c) => c.sheetName === name),
  );

  const missingRequired = requiredSheets.filter(
    (name) => !sheetNames.includes(name),
  );

  const missingOptional = OPTIONAL_SHEETS.filter(
    (name) => !sheetNames.includes(name),
  );

  return {
    valid: missingRequired.length === 0,
    found,
    missingRequired,
    missingOptional,
  };
}

/* =========================================================
 * FK CACHE - Tracks all valid IDs (from DB + imported)
 * ========================================================= */

class ForeignKeyCache {
  private cache = new Map<string, Set<number>>();

  private getKey(model: PrismaModelName, field: string): string {
    return `${model}:${field}`;
  }

  async preload(
    tx: PrismaTransactionClient,
    model: PrismaModelName,
    field: string,
  ): Promise<void> {
    const key = this.getKey(model, field);
    if (this.cache.has(key)) return;

    try {
      const prismaModel = tx[model as keyof typeof tx] as any;
      if (!prismaModel?.findMany) {
        this.cache.set(key, new Set());
        return;
      }

      const records = await prismaModel.findMany({
        select: { [field]: true },
      });

      const ids = new Set<number>();
      for (const record of records) {
        const id = record[field];
        if (typeof id === "number") {
          ids.add(id);
        }
      }

      this.cache.set(key, ids);
      console.log(`✅ Preloaded ${ids.size} IDs for ${model}.${field}`);
    } catch (error) {
      console.error(`❌ Failed to preload ${model}.${field}:`, error);
      this.cache.set(key, new Set());
    }
  }

  add(model: PrismaModelName, field: string, id: number): void {
    const key = this.getKey(model, field);
    if (!this.cache.has(key)) {
      this.cache.set(key, new Set());
    }
    this.cache.get(key)!.add(id);
    console.log(`📝 Added to cache: ${model}.${field} = ${id}`);
  }

  has(model: PrismaModelName, field: string, id: number): boolean {
    const key = this.getKey(model, field);
    return this.cache.get(key)?.has(id) ?? false;
  }

  clear(): void {
    this.cache.clear();
  }

  // NEW: Debug method to see cache contents
  debugPrint(model: PrismaModelName, field: string): void {
    const key = this.getKey(model, field);
    const ids = this.cache.get(key);
    console.log(
      `🔍 Cache for ${key}: ${ids ? Array.from(ids).join(", ") : "empty"}`,
    );
  }
}

const fkCache = new ForeignKeyCache();

/* =========================================================
 * PRE-VALIDATE ALL FOREIGN KEYS
 * ========================================================= */

async function preloadAllForeignKeys(
  tx: PrismaTransactionClient,
): Promise<void> {
  console.log("🔄 Preloading foreign key caches...");

  // Preload all referenced tables
  const tablesToPreload: Array<{ model: PrismaModelName; field: string }> = [
    { model: "region", field: "Id_Reg" },
    { model: "departement", field: "Id_Dept" },
    { model: "arrondissement", field: "Id_Arrond" },
    { model: "lotissement", field: "Id_Lotis" },
    { model: "parcelle", field: "Id_Parcel" },
    { model: "batiment", field: "Id_Bat" },
    { model: "route", field: "Id_Rte" },
    { model: "riviere", field: "Id_Riv" },
    { model: "equipement", field: "Id_Equip" },
    { model: "infrastructure", field: "Id_Infras" },
    { model: "borne", field: "Id_Borne" },
    { model: "taxe_immobiliere", field: "Id_Taxe" },
    { model: "reseau_energetique", field: "Id_Reseaux" },
    { model: "reseau_en_eau", field: "Id_Reseaux" },
  ];

  for (const { model, field } of tablesToPreload) {
    await fkCache.preload(tx, model, field);
  }

  console.log("✅ Foreign key caches preloaded");
}

/* =========================================================
 * VALIDATE FOREIGN KEYS FOR A ROW
 * ========================================================= */

function validateForeignKeysSync(
  data: Record<string, unknown>,
  model: PrismaModelName,
  rowNumber: number, // Added for better error messages
): { valid: boolean; errors: string[]; warnings: string[] } {
  const fkConfigs = getForeignKeyConfig(model);
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const fk of fkConfigs) {
    const fkValue = data[fk.field] as number | null | undefined;

    // Skip null/undefined values
    if (fkValue === null || fkValue === undefined) {
      if (fk.required) {
        errors.push(`Missing required FK: ${fk.field}`);
      }
      continue;
    }

    // Check if FK exists in cache
    if (!fkCache.has(fk.referencedModel, fk.referencedField, fkValue)) {
      if (fk.required) {
        // Debug: print cache contents
        console.error(
          `❌ Row ${rowNumber}: FK validation failed for ${fk.field}=${fkValue}`,
        );
        fkCache.debugPrint(fk.referencedModel, fk.referencedField);

        errors.push(
          `FK ${fk.field}=${fkValue} not found in ${fk.referencedModel}.${fk.referencedField}`,
        );
      } else {
        // For optional FKs, nullify the value and add warning
        warnings.push(`FK ${fk.field}=${fkValue} not found, setting to null`);
        data[fk.field] = null;
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/* =========================================================
 * BUILD COMPOSITE KEY WHERE CLAUSE
 * ========================================================= */

function buildCompositeKeyWhere(
  data: Record<string, unknown>,
  fields: string[],
): Record<string, unknown> {
  const keyName = fields.join("_");
  const keyValues: Record<string, unknown> = {};

  for (const field of fields) {
    keyValues[field] = data[field];
  }

  return { [keyName]: keyValues };
}

/* =========================================================
 * PROCESS SINGLE SHEET
 * ========================================================= */

async function processSheet(
  worksheet: ExcelJS.Worksheet,
  config: SheetConfig,
  tx: PrismaTransactionClient,
  userId: string | null,
): Promise<SheetResult> {
  const result: SheetResult = {
    sheetName: config.sheetName,
    model: config.model,
    status: "success",
    imported: 0,
    duplicates: 0,
    skipped: 0,
    errors: [],
    warnings: [],
  };

  console.log(
    `📊 Processing sheet: ${config.sheetName} (model: ${config.model})`,
  );

  // Collect all rows
  const rows: unknown[][] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header

    const values: unknown[] = [];
    for (let i = 1; i <= config.columnCount; i++) {
      const cell = row.getCell(i);
      values.push(cell.value);
    }
    rows.push(values);
  });

  if (rows.length === 0) {
    result.status = "skipped";
    result.warnings.push("Sheet is empty (no data rows)");
    console.log(`⚠️  Sheet ${config.sheetName} is empty`);
    return result;
  }

  console.log(`   Processing ${rows.length} rows...`);

  // Process each row
  for (let i = 0; i < rows.length; i++) {
    const rowNumber = i + 2;
    const rawRow = rows[i];

    try {
      // Apply mappers
      const mappedRow = rawRow.map((val, idx) =>
        idx < config.mappers.length ? config.mappers[idx](val) : val,
      );

      // Create transform context
      const ctx: TransformContext = {
        rowNumber,
        sheetName: config.sheetName,
        addWarning: (msg: string) =>
          result.warnings.push(`Row ${rowNumber}: ${msg}`),
        addError: (msg: string) =>
          result.errors.push(`Row ${rowNumber}: ${msg}`),
        userId,
      };

      // Transform row
      const data = config.transform(mappedRow, ctx);

      if (!data) {
        result.skipped++;
        continue;
      }

      // Validate with Zod schema if provided
      if (config.schema) {
        const validation = config.schema.safeParse(data);
        if (!validation.success) {
          const errorMessages = validation.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join(", ");
          result.errors.push(
            `Row ${rowNumber}: Schema validation failed - ${errorMessages}`,
          );
          result.skipped++;
          continue;
        }
      }

      // Validate foreign keys BEFORE attempting insert
      const fkValidation = validateForeignKeysSync(
        data as Record<string, unknown>,
        config.model,
        rowNumber, // Pass row number for debugging
      );

      // Add FK warnings
      for (const warning of fkValidation.warnings) {
        result.warnings.push(`Row ${rowNumber}: ${warning}`);
      }

      if (!fkValidation.valid) {
        for (const err of fkValidation.errors) {
          result.errors.push(`Row ${rowNumber}: ${err}`);
        }
        result.skipped++;
        continue;
      }

      // Get Prisma model
      const prismaModel = tx[config.model as keyof typeof tx] as any;
      if (!prismaModel) {
        result.errors.push(`Row ${rowNumber}: Model ${config.model} not found`);
        result.skipped++;
        continue;
      }

      // Perform database operation
      if (config.compositeKey) {
        // Junction table with composite key
        const whereClause = buildCompositeKeyWhere(
          data as Record<string, unknown>,
          config.compositeKey.fields,
        );

        try {
          await prismaModel.upsert({
            where: whereClause,
            create: data,
            update: data,
          });
          result.imported++;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";

          if (
            message.includes("Unique constraint") ||
            message.includes("duplicate key")
          ) {
            result.duplicates++;
          } else {
            result.errors.push(`Row ${rowNumber}: ${message}`);
            result.skipped++;
          }
        }
      } else if (config.uniqueKey || config.primaryKey) {
        // Single primary key
        const uniqueKey = config.uniqueKey || config.primaryKey!;
        const uniqueValue = (data as Record<string, unknown>)[uniqueKey];

        if (uniqueValue === null || uniqueValue === undefined) {
          // Create new record (auto-increment ID)
          const created = await prismaModel.create({ data });
          result.imported++;

          // ✅ FIX #1: Add to cache immediately after creation
          const newId = created[uniqueKey];
          if (typeof newId === "number") {
            fkCache.add(config.model, uniqueKey, newId);
          }
        } else {
          // Upsert existing record
          // ✅ FIX #2: Capture the result to get the actual ID
          const upserted = await prismaModel.upsert({
            where: { [uniqueKey]: uniqueValue },
            create: data,
            update: data,
          });
          result.imported++;

          // ✅ FIX #3: Add to cache using the returned ID (handles both create and update)
          const resultId = upserted[uniqueKey];
          if (typeof resultId === "number") {
            fkCache.add(config.model, uniqueKey, resultId);
          }
        }
      } else {
        // No key - just create
        const created = await prismaModel.create({ data });
        result.imported++;

        // ✅ FIX #4: Try to add to cache even for records without explicit key
        // This handles models where the primary key might be useful for FK references
        if (config.primaryKey) {
          const newId = created[config.primaryKey];
          if (typeof newId === "number") {
            fkCache.add(config.model, config.primaryKey, newId);
          }
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";

      if (
        message.includes("Unique constraint") ||
        message.includes("duplicate key")
      ) {
        result.duplicates++;
        result.warnings.push(`Row ${rowNumber}: Duplicate record`);
      } else if (message.includes("Foreign key constraint")) {
        result.errors.push(
          `Row ${rowNumber}: FK constraint failed - ${message}`,
        );
        result.skipped++;
      } else {
        result.errors.push(`Row ${rowNumber}: ${message}`);
        result.skipped++;
      }
    }
  }

  // Determine final status
  if (result.errors.length === 0 && result.imported > 0) {
    result.status = "success";
  } else if (result.imported > 0) {
    result.status = "partial";
  } else if (result.errors.length > 0) {
    result.status = "failed";
  } else {
    result.status = "skipped";
  }

  console.log(
    `   ✅ Sheet ${config.sheetName}: ${result.imported} imported, ${result.skipped} skipped, ${result.errors.length} errors`,
  );

  return result;
}

/* =========================================================
 * MAIN WORKBOOK PROCESSOR
 * ========================================================= */

export async function processExcelWorkbook(
  workbook: ExcelJS.Workbook,
  tx: PrismaTransactionClient,
  userId: string,
): Promise<ImportResult> {
  console.log(`🚀 Starting Excel import for user: ${userId}`);

  // Clear and preload FK cache
  fkCache.clear();
  await preloadAllForeignKeys(tx);

  const importOrder = getImportOrder();
  const results: SheetResult[] = [];
  const globalErrors: string[] = [];

  let totalImported = 0;
  let totalDuplicates = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  let processedSheets = 0;

  console.log(`📋 Import order: ${importOrder.join(" → ")}`);

  // ✅ CRITICAL: Process sheets SEQUENTIALLY (not in parallel)
  for (const sheetName of importOrder) {
    const worksheet = workbook.getWorksheet(sheetName);
    const config = getSheetConfig(sheetName);

    if (!config) {
      console.log(`⚠️  No config found for sheet: ${sheetName}`);
      continue;
    }

    if (!worksheet) {
      if (!OPTIONAL_SHEETS.includes(sheetName)) {
        globalErrors.push(`Required sheet "${sheetName}" not found`);
        console.error(`❌ Required sheet "${sheetName}" not found`);
      } else {
        console.log(`ℹ️  Optional sheet "${sheetName}" not found, skipping`);
      }
      continue;
    }

    try {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`Processing sheet: ${sheetName}`);
      console.log("=".repeat(60));

      const sheetResult = await processSheet(worksheet, config, tx, userId);
      results.push(sheetResult);

      totalImported += sheetResult.imported;
      totalDuplicates += sheetResult.duplicates;
      totalSkipped += sheetResult.skipped;
      totalErrors += sheetResult.errors.length;
      processedSheets++;

      console.log(`✅ Sheet ${sheetName} completed:`);
      console.log(`   - Imported: ${sheetResult.imported}`);
      console.log(`   - Skipped: ${sheetResult.skipped}`);
      console.log(`   - Errors: ${sheetResult.errors.length}`);
      console.log(`   - Status: ${sheetResult.status}`);

      // ✅ OPTIONAL: Add a small delay between sheets to ensure transaction commits
      // This can help with race conditions in some database configurations
      if (sheetResult.imported > 0) {
        await new Promise((resolve) => setTimeout(resolve, 50)); // 50ms delay
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";

      console.error(`❌ Fatal error processing sheet "${sheetName}":`, message);
      globalErrors.push(`Sheet "${sheetName}": ${message}`);

      results.push({
        sheetName,
        model: config.model,
        status: "failed",
        imported: 0,
        duplicates: 0,
        skipped: 0,
        errors: [message],
        warnings: [],
      });

      totalErrors++;
    }
  }

  // Determine overall success
  const hasGlobalErrors = globalErrors.length > 0;
  const hasImports = totalImported > 0;
  const success = hasImports && !hasGlobalErrors;

  console.log(`\n${"=".repeat(60)}`);
  console.log(`📊 IMPORT SUMMARY`);
  console.log("=".repeat(60));
  console.log(`Total Imported: ${totalImported}`);
  console.log(`Total Duplicates: ${totalDuplicates}`);
  console.log(`Total Skipped: ${totalSkipped}`);
  console.log(`Total Errors: ${totalErrors}`);
  console.log(`Processed Sheets: ${processedSheets}/${importOrder.length}`);
  console.log(`Overall Success: ${success ? "✅ YES" : "❌ NO"}`);
  console.log("=".repeat(60));

  return {
    success,
    totalSheets: importOrder.length,
    processedSheets,
    results,
    errors: globalErrors,
    summary: {
      totalImported,
      totalDuplicates,
      totalSkipped,
      totalErrors,
    },
  };
}

/* =========================================================
 * RE-EXPORTS
 * ========================================================= */

export { getImportOrder, getRequiredSheets, OPTIONAL_SHEETS };
