// lib/utils/processExcelUpload.ts
import { Workbook, Worksheet } from "exceljs";
import { PrismaClient } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  excelImportConfig,
  OPTIONAL_SHEETS,
  SheetConfig,
  TransformContext,
} from "@/lib/config/excel-import-config";

/* =========================================================
 * TYPES
 * ========================================================= */

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export interface SheetResult {
  sheetName: string;
  status: "success" | "partial" | "failed" | "skipped";
  totalRows: number;
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

/* =========================================================
 * CONSTANTS
 * ========================================================= */

const BATCH_SIZE = 100;
const MAX_ERRORS_PER_SHEET = 50; // Limit error messages to prevent flooding
const MAX_WARNINGS_PER_SHEET = 20;

/* =========================================================
 * HELPER FUNCTIONS
 * ========================================================= */

function createTransformContext(
  sheetName: string,
  rowNumber: number,
  warnings: string[],
  errors: string[],
): TransformContext {
  return {
    sheetName,
    rowNumber,
    addWarning: (message: string) => {
      if (warnings.length < MAX_WARNINGS_PER_SHEET) {
        warnings.push(`Row ${rowNumber}: ${message}`);
      }
    },
    addError: (message: string) => {
      if (errors.length < MAX_ERRORS_PER_SHEET) {
        errors.push(`Row ${rowNumber}: ${message}`);
      }
    },
  };
}

function processSheet(
  sheet: Worksheet,
  config: SheetConfig,
): {
  data: Record<string, unknown>[];
  totalRows: number;
  skipped: number;
  warnings: string[];
  errors: string[];
} {
  const data: Record<string, unknown>[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];
  let totalRows = 0;
  let skipped = 0;

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    // Skip header row
    if (rowNumber === 1) return;
    totalRows++;

    const values = row.values as unknown[];
    // ExcelJS row values are 1-indexed, slice from 1
    const cells = values.slice(1, config.columnCount + 1);

    // Check column count
    if (cells.length < config.columnCount) {
      if (errors.length < MAX_ERRORS_PER_SHEET) {
        errors.push(
          `Row ${rowNumber}: Expected ${config.columnCount} columns, got ${cells.length}`,
        );
      }
      skipped++;
      return;
    }

    try {
      // Apply mappers
      const mappedValues = config.mappers.map((mapper, index) => {
        try {
          return mapper(cells[index]);
        } catch (mapError) {
          if (warnings.length < MAX_WARNINGS_PER_SHEET) {
            warnings.push(
              `Row ${rowNumber}, Col ${index + 1}: Mapping failed - ${(mapError as Error).message}`,
            );
          }
          return null;
        }
      });

      // Create transform context
      const ctx = createTransformContext(
        config.sheetName,
        rowNumber,
        warnings,
        errors,
      );

      // Transform row data
      const item = config.transform(mappedValues, ctx);

      if (item !== null) {
        // Optional: Validate with Zod schema
        if (config.schema) {
          const validation = config.schema.safeParse(item);
          if (!validation.success) {
            if (errors.length < MAX_ERRORS_PER_SHEET) {
              const zodErrors = validation.error.issues
                .map((e: any) => `${e.path.join(".")}: ${e.message}`)
                .join("; ");
              errors.push(`Row ${rowNumber}: Validation failed - ${zodErrors}`);
            }
            skipped++;
            return;
          }
        }
        data.push(item);
      } else {
        skipped++;
      }
    } catch (transformError) {
      if (errors.length < MAX_ERRORS_PER_SHEET) {
        errors.push(
          `Row ${rowNumber}: Transform error - ${(transformError as Error).message}`,
        );
      }
      skipped++;
    }
  });

  // Add overflow messages if needed
  if (warnings.length === MAX_WARNINGS_PER_SHEET) {
    warnings.push(`... and more warnings (limit reached)`);
  }
  if (errors.length === MAX_ERRORS_PER_SHEET) {
    errors.push(`... and more errors (limit reached)`);
  }

  return { data, totalRows, skipped, warnings, errors };
}

async function importBatches(
  model: any,
  data: Record<string, unknown>[],
  sheetName: string,
): Promise<{
  imported: number;
  duplicates: number;
  errors: string[];
}> {
  let totalImported = 0;
  let totalDuplicates = 0;
  const errors: string[] = [];

  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

    try {
      const result = await model.createMany({
        data: batch,
        skipDuplicates: true,
      });

      const imported = result.count ?? 0;
      const duplicates = batch.length - imported;

      totalImported += imported;
      totalDuplicates += duplicates;
    } catch (batchError) {
      const message =
        batchError instanceof Error
          ? batchError.message
          : "Unknown database error";
      errors.push(`Batch ${batchNumber}: ${message}`);

      // Try to identify which records failed
      if (message.includes("Unique constraint")) {
        errors.push(
          `Batch ${batchNumber}: Some records have duplicate unique keys`,
        );
      } else if (message.includes("Foreign key constraint")) {
        errors.push(
          `Batch ${batchNumber}: Some records reference non-existent foreign keys`,
        );
      }
    }
  }

  return { imported: totalImported, duplicates: totalDuplicates, errors };
}

/* =========================================================
 * MAIN FUNCTION
 * ========================================================= */

export async function processExcelWorkbook(
  workbook: Workbook,
  client: PrismaClient | PrismaTransactionClient = prisma,
): Promise<ImportResult> {
  const results: SheetResult[] = [];
  const globalErrors: string[] = [];

  let totalImported = 0;
  let totalDuplicates = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const config of excelImportConfig) {
    const sheet = workbook.getWorksheet(config.sheetName);

    // Handle missing sheets
    if (!sheet) {
      if (!OPTIONAL_SHEETS.includes(config.sheetName)) {
        globalErrors.push(`Required sheet "${config.sheetName}" not found`);
        results.push({
          sheetName: config.sheetName,
          status: "failed",
          totalRows: 0,
          imported: 0,
          duplicates: 0,
          skipped: 0,
          errors: [`Sheet not found in workbook`],
          warnings: [],
        });
        totalErrors++;
      } else {
        results.push({
          sheetName: config.sheetName,
          status: "skipped",
          totalRows: 0,
          imported: 0,
          duplicates: 0,
          skipped: 0,
          errors: [],
          warnings: [`Optional sheet not found`],
        });
      }
      continue;
    }

    // Process sheet data
    const {
      data,
      totalRows,
      skipped: rowsSkipped,
      warnings,
      errors: rowErrors,
    } = processSheet(sheet, config);

    // If no valid data, skip import
    if (data.length === 0) {
      results.push({
        sheetName: config.sheetName,
        status: totalRows === 0 ? "skipped" : "failed",
        totalRows,
        imported: 0,
        duplicates: 0,
        skipped: rowsSkipped,
        errors: rowErrors,
        warnings: [
          ...warnings,
          totalRows === 0
            ? "Sheet is empty (no data rows)"
            : "No valid data to import after processing",
        ],
      });
      totalSkipped += rowsSkipped;
      totalErrors += rowErrors.length;
      continue;
    }

    // Get Prisma model
    const model = (client as any)[config.model];
    if (!model?.createMany) {
      const errorMsg = `Model "${config.model}" not found or doesn't support createMany`;
      globalErrors.push(errorMsg);
      results.push({
        sheetName: config.sheetName,
        status: "failed",
        totalRows,
        imported: 0,
        duplicates: 0,
        skipped: rowsSkipped,
        errors: [...rowErrors, errorMsg],
        warnings,
      });
      totalErrors++;
      continue;
    }

    // Import data in batches
    const {
      imported,
      duplicates,
      errors: importErrors,
    } = await importBatches(model, data, config.sheetName);

    // Determine status
    let status: SheetResult["status"];
    if (importErrors.length > 0) {
      status = imported > 0 ? "partial" : "failed";
    } else {
      status = "success";
    }

    // Compile result
    const sheetResult: SheetResult = {
      sheetName: config.sheetName,
      status,
      totalRows,
      imported,
      duplicates,
      skipped: rowsSkipped,
      errors: [...rowErrors, ...importErrors],
      warnings,
    };

    results.push(sheetResult);

    // Update totals
    totalImported += imported;
    totalDuplicates += duplicates;
    totalSkipped += rowsSkipped;
    totalErrors += rowErrors.length + importErrors.length;
  }

  // Determine overall success
  const hasFailures = results.some((r) => r.status === "failed");
  const hasPartialSuccess = results.some((r) => r.status === "partial");
  const success = !hasFailures && globalErrors.length === 0;

  return {
    success,
    totalSheets: excelImportConfig.length,
    processedSheets: results.filter((r) => r.status !== "skipped").length,
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
 * UTILITY: Validate workbook structure before processing
 * ========================================================= */

export function validateWorkbookStructure(workbook: Workbook): {
  valid: boolean;
  missingRequired: string[];
  missingOptional: string[];
  found: string[];
} {
  const found: string[] = [];
  const missingRequired: string[] = [];
  const missingOptional: string[] = [];

  for (const config of excelImportConfig) {
    const sheet = workbook.getWorksheet(config.sheetName);
    if (sheet) {
      found.push(config.sheetName);
    } else if (OPTIONAL_SHEETS.includes(config.sheetName)) {
      missingOptional.push(config.sheetName);
    } else {
      missingRequired.push(config.sheetName);
    }
  }

  return {
    valid: missingRequired.length === 0,
    missingRequired,
    missingOptional,
    found,
  };
}

/* =========================================================
 * UTILITY: Get import order (for documentation/debugging)
 * ========================================================= */

export function getImportOrder(): {
  order: number;
  sheet: string;
  model: string;
  dependencies: string[];
}[] {
  return excelImportConfig.map((config, index) => ({
    order: index + 1,
    sheet: config.sheetName,
    model: config.model,
    dependencies: config.dependencies || [],
  }));
}
