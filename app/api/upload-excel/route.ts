// app/api/upload-excel/route.ts
import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import prisma from '@/lib/prisma';
import { processExcelWorkbook } from '@/lib/utils/processExcelUpload';
import { Readable } from 'stream';

/* -------------------------------------------------
 * 1.  optional sheets – same list you already use
 * ------------------------------------------------- */
const OPTIONAL_SHEETS = [
  'Payer','Limitrophe','Alimenter','Contenir',
  'Trouver','Eclairer','Desservir','Approvisionner'
];

/* -------------------------------------------------
 * 2.  helper: buffer → Node Readable stream
 * ------------------------------------------------- */
function bufferToStream(buffer: ArrayBuffer): Readable {
  const stream = new Readable();
  stream.push(Buffer.from(buffer));
  stream.push(null); // EOF
  return stream;
}

export async function POST(request: Request) {
  /* ---------- 3.  body size guard (adjust as needed) ---------- */
  const maxBytes = 10 * 1024 * 1024; // 10 MB
  const contentLength = request.headers.get('content-length');
  if (contentLength && Number(contentLength) > maxBytes) {
    return NextResponse.json(
      { error: 'File too large. Max 10 MB allowed.' },
      { status: 413 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('excelFile');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No valid Excel file uploaded' }, { status: 400 });
    }

    /* ---------- 4.  stream workbook into ExcelJS ---------- */
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.read(bufferToStream(arrayBuffer)); // streaming read

    /* ---------- 5.  same transaction logic you already had ---------- */
    const result = await prisma.$transaction(async (tx) =>
      processExcelWorkbook(workbook, tx)
    );

    const criticalErrors = result.errors.filter(
      (e) => !OPTIONAL_SHEETS.some((s) => e.includes(`Sheet "${s}" not found`))
    );

    if (criticalErrors.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All data imported successfully!',
        details: result.results,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Import completed with errors',
        imported: result.results,
        errors: criticalErrors,
      },
      { status: 422 }
    );
  } catch (error) {
    console.error('Excel upload error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Import failed', details: message }, { status: 500 });
  }
}