// app/api/upload-excel/route.ts
import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  processExcelWorkbook,
  validateWorkbookStructure,
  ImportResult,
} from "@/lib/utils/processExcelUpload";

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

function formatImportResponse(
  result: ImportResult,
  userId: string,
  userEmail?: string,
) {
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
    // ========================================
    // 1. AUTHENTICATE USER
    // ========================================
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "You must be signed in to import data",
        },
        { status: 401 },
      );
    }

    const currentUserId = session.user.id;
    const userEmail = session.user.email;

    console.log(`📥 Import started by user: ${currentUserId} (${userEmail})`);

    // Check role permissions
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden",
          message: "Only administrators can import data",
        },
        { status: 403 },
      );
    }

    // ========================================
    // 2. VALIDATE FILE SIZE (early check)
    // ========================================
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

    // ========================================
    // 3. PARSE FORM DATA
    // ========================================
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

    console.log(
      `📄 Processing file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
    );

    // ========================================
    // 4. VALIDATE FILE EXTENSION
    // ========================================
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

    // ========================================
    // 5. VALIDATE MIME TYPE
    // ========================================
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

    // ========================================
    // 6. VALIDATE FILE SIZE
    // ========================================
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

    // ========================================
    // 7. PARSE EXCEL WORKBOOK
    // ========================================
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const workbook = new ExcelJS.Workbook();

    try {
      await workbook.xlsx.load(uint8Array as any);
      console.log(
        `📊 Workbook loaded with ${workbook.worksheets.length} sheets`,
      );
    } catch (parseError) {
      console.error("Failed to parse Excel file:", parseError);
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

    // ========================================
    // 8. VALIDATE WORKBOOK STRUCTURE
    // ========================================
    const validation = validateWorkbookStructure(workbook);

    if (!validation.valid) {
      console.error("Invalid workbook structure:", validation);
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

    console.log(`✅ Workbook structure validated`);
    console.log(`   - Found sheets: ${validation.found.join(", ")}`);
    if (validation.missingOptional.length > 0) {
      console.log(
        `   - Missing optional: ${validation.missingOptional.join(", ")}`,
      );
    }

    // ========================================
    // 9. PROCESS IN TRANSACTION
    // ⚠️ CRITICAL: Pass userId as 3rd parameter
    // ========================================
    console.log(`🚀 Starting import transaction...`);

    const result = await prisma.$transaction(
      async (tx) => {
        // ⚠️ PASS currentUserId HERE - it will auto-populate createdById
        return await processExcelWorkbook(workbook, tx, currentUserId);
      },
      {
        maxWait: 30000, // 30 seconds max wait
        timeout: 120000, // 2 minutes timeout for large files
      },
    );

    console.log(`✅ Import completed`);
    console.log(`   - Success: ${result.success}`);
    console.log(`   - Total imported: ${result.summary.totalImported}`);
    console.log(`   - Total errors: ${result.summary.totalErrors}`);
    console.log(`   - Total skipped: ${result.summary.totalSkipped}`);

    // ========================================
    // 10. RETURN FORMATTED RESPONSE
    // ========================================
    const response = formatImportResponse(result, currentUserId, userEmail);
    const statusCode = result.success ? 200 : 422;

    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    console.error("❌ Excel upload error:", error);

    // ========================================
    // ERROR HANDLING
    // ========================================

    // Handle specific error types
    if (error instanceof Error) {
      // Transaction timeout
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
  try {
    // Check authentication for GET endpoint too (optional)
    const session = await getServerSession(authOptions);

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
      // Include user info if authenticated
      ...(session?.user && {
        currentUser: {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
        },
      }),
      notes: {
        createdById:
          "This field is automatically populated from your user session. Do not include it in Excel files.",
        columnCounts: {
          Lotissement: "31 columns (createdById removed)",
          Parcelle: "33 columns (createdById removed)",
          Batiment: "47 columns (createdById removed)",
        },
      },
    });
  } catch (error) {
    console.error("GET endpoint error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch import info",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
