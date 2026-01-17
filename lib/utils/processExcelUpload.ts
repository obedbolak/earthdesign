// lib/utils/processExcelUpload.ts
import { Workbook } from "exceljs";
import { PrismaClient } from "@prisma/client";
import prisma from "@/lib/prisma";
import { excelImportConfig } from "@/lib/config/excel-import-config";

// Exact type of the client passed to $transaction callbacks lets use the omit trick
type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

// Define optional sheets that won't generate errors if missing
const OPTIONAL_SHEETS = [
  "Payer",
  "Limitrophe",
  "Alimenter",
  "Contenir",
  "Trouver",
  "Eclairer",
  "Desservir",
  "Approvisionner",
];

const BATCH_SIZE = 100; // Process 100 records at a time

export async function processExcelWorkbook(
  workbook: Workbook,
  client: PrismaClient | PrismaTransactionClient = prisma
) {
  const results: string[] = [];
  const errors: string[] = [];

  for (const config of excelImportConfig) {
    const sheet = workbook.getWorksheet(config.sheetName);

    if (!sheet) {
      // Only add error if this is not an optional sheet
      if (!OPTIONAL_SHEETS.includes(config.sheetName)) {
        errors.push(`Sheet "${config.sheetName}" not found in the Excel file.`);
      }
      continue;
    }

    const data: Record<string, unknown>[] = [];
    let processedRows = 0;

    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      processedRows++;

      const values = row.values as unknown[];
      const cells = values.slice(1, config.columnCount + 1);

      if (cells.length < config.columnCount) {
        errors.push(
          `Row ${rowNumber} in "${config.sheetName}" has fewer columns than expected (${cells.length} < ${config.columnCount})`
        );
        return;
      }

      const mappedValues = config.mappers.map((mapper, index) =>
        mapper(cells[index])
      );

      const item = config.transform(mappedValues);
      if (item) {
        data.push(item);
      }
    });

    if (data.length === 0) {
      results.push(
        `"${config.sheetName}": no valid data found (${processedRows} rows processed)`
      );
      continue;
    }

    try {
      // Dynamic model access — safe because all models exist on both client types
      const model = (client as any)[config.model];

      if (!model?.createMany) {
        throw new Error(`Model "${config}" not found on Prisma client`);
      }

      // **BATCH PROCESSING** - Split data into chunks
      let totalImported = 0;

      for (let i = 0; i < data.length; i += BATCH_SIZE) {
        const batch = data.slice(i, i + BATCH_SIZE);

        const result = await model.createMany({
          data: batch,
          skipDuplicates: true,
        });

        totalImported += result.count || batch.length;
      }

      results.push(
        `"${config.sheetName}": ${totalImported} records imported successfully`
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown database error";
      errors.push(`Failed to import "${config.sheetName}": ${message}`);
    }
  }

  return {
    success: errors.length === 0,
    results,
    errors,
  };
}
