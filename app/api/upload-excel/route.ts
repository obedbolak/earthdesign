// app/api/upload-excel/route.ts
import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import prisma from "@/lib/prisma";
import {
  processExcelWorkbook,
  validateWorkbookStructure,
  ImportResult,
} from "@/lib/utils/processExcelUpload";
// Optional: Add auth check
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";

/* =========================================================
 * CONSTANTS
 * ========================================================= */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
];

const ALLOWED_EXTENSIONS = [".xlsx", ".xls"];

/* =========================================================
 * HELPER FUNCTIONS
 * ========================================================= */

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot !== -1 ? filename.slice(lastDot).toLowerCase() : "";
}

function formatImportResponse(result: ImportResult) {
  const successSheets = result.results.filter((r) => r.status === "success");
  const partialSheets = result.results.filter((r) => r.status === "partial");
  const failedSheets = result.results.filter((r) => r.status === "failed");

  let message: string;
  if (result.success) {
    message = `Successfully imported ${result.summary.totalImported} records from ${successSheets.length} sheets`;
  } else if (partialSheets.length > 0 || successSheets.length > 0) {
    message = `Import completed with issues: ${result.summary.totalImported} imported, ${result.summary.totalErrors} errors`;
  } else {
    message = `Import failed: ${result.summary.totalErrors} errors`;
  }

  return {
    success: result.success,
    message,
    details: {
      totalSheets: result.totalSheets,
      processedSheets: result.processedSheets,
      summary: result.summary,
      sheets: result.results.map((r) => ({
        name: r.sheetName,
        status: r.status,
        imported: r.imported,
        duplicates: r.duplicates,
        skipped: r.skipped,
        errorCount: r.errors.length,
        warningCount: r.warnings.length,
      })),
    },
    // Only include errors/warnings in response if there are any
    ...(result.errors.length > 0 && { errors: result.errors }),
    ...(result.results.some((r) => r.errors.length > 0) && {
      sheetErrors: result.results
        .filter((r) => r.errors.length > 0)
        .map((r) => ({
          sheet: r.sheetName,
          errors: r.errors.slice(0, 10), // Limit to first 10 errors per sheet
        })),
    }),
  };
}

/* =========================================================
 * ROUTE HANDLER
 * ========================================================= */

export async function POST(request: Request) {
  try {
    // Optional: Auth check
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // 1. Size guard (early check before parsing)
    const contentLength = request.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "File too large",
          details: `Maximum file size is ${MAX_FILE_SIZE / (1024 * 1024)} MB`,
        },
        { status: 413 },
      );
    }

    // 2. Parse form data
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse form data",
          details: "Ensure the request contains valid multipart/form-data",
        },
        { status: 400 },
      );
    }

    const file = formData.get("excelFile");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "No file uploaded",
          details: 'Expected a file with field name "excelFile"',
        },
        { status: 400 },
      );
    }

    // 3. Validate file extension
    const fileExtension = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file extension",
          details: `Allowed extensions: ${ALLOWED_EXTENSIONS.join(", ")}`,
          received: fileExtension || "none",
        },
        { status: 400 },
      );
    }

    // 4. Validate MIME type (with fallback for edge cases)
    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
      // Some systems might send different MIME types, check extension as fallback
      if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid file type",
            details: "Please upload an Excel file (.xlsx or .xls)",
            received: file.type,
          },
          { status: 400 },
        );
      }
    }

    // 5. Double-check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "File too large",
          details: `File size: ${(file.size / (1024 * 1024)).toFixed(2)} MB. Maximum: ${MAX_FILE_SIZE / (1024 * 1024)} MB`,
        },
        { status: 413 },
      );
    }

    // 6. Read and parse workbook
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const workbook = new ExcelJS.Workbook();

    try {
      await workbook.xlsx.load(uint8Array as any);
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse Excel file",
          details:
            "The file appears to be corrupted or is not a valid Excel file. Please ensure it's a valid .xlsx file.",
        },
        { status: 400 },
      );
    }

    // 7. Validate workbook structure
    const validation = validateWorkbookStructure(workbook);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid workbook structure",
          details: `Missing required sheets: ${validation.missingRequired.join(", ")}`,
          found: validation.found,
          missingRequired: validation.missingRequired,
          missingOptional: validation.missingOptional,
        },
        { status: 400 },
      );
    }

    // 8. Process in transaction
    const result = await prisma.$transaction(
      async (tx) => processExcelWorkbook(workbook, tx),
      {
        maxWait: 30000,
        timeout: 120000, // 2 minutes for large files
      },
    );

    // 9. Return formatted response
    const response = formatImportResponse(result);
    const statusCode = result.success ? 200 : 422;

    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    console.error("Excel upload error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      // Prisma transaction timeout
      if (
        error.message.includes("Transaction already closed") ||
        error.message.includes("timeout")
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Import timeout",
            details:
              "The file is too large or contains too much data. Try splitting into smaller files (max ~5000 rows per sheet).",
          },
          { status: 408 },
        );
      }

      // Foreign key constraint
      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          {
            success: false,
            error: "Data dependency error",
            details:
              "Some records reference data that doesn't exist. Ensure parent records are imported before dependent records.",
          },
          { status: 422 },
        );
      }

      // Unique constraint
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          {
            success: false,
            error: "Duplicate data error",
            details:
              "Some records already exist in the database with the same unique keys.",
          },
          { status: 422 },
        );
      }
    }

    // Generic error
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return NextResponse.json(
      {
        success: false,
        error: "Import failed",
        details: message,
      },
      { status: 500 },
    );
  }
}

/* =========================================================
 * GET: Return import info/template structure
 * ========================================================= */

export async function GET() {
  const { getImportOrder } = await import("@/lib/utils/processExcelUpload");
  const { getRequiredSheets, OPTIONAL_SHEETS } =
    await import("@/lib/config/excel-import-config");

  return NextResponse.json({
    info: "Excel Import API",
    version: "2.0",
    maxFileSize: `${MAX_FILE_SIZE / (1024 * 1024)} MB`,
    allowedFormats: ALLOWED_EXTENSIONS,
    requiredSheets: getRequiredSheets(),
    optionalSheets: OPTIONAL_SHEETS,
    importOrder: getImportOrder(),
  });
}
