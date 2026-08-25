import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  excelImportConfig,
  type PrismaModelName,
} from "@/lib/config/excel-import-config";
import {
  backupColumns,
  getBackupValue,
} from "@/lib/config/excel-backup-config";

export const runtime = "nodejs";

type PrismaDelegate = {
  findMany: () => Promise<Record<string, unknown>[]>;
};

function backupFilename() {
  return `earthdesign-backup-${new Date().toISOString().slice(0, 10)}.xlsx`;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Only administrators can download a full backup" },
      { status: 403 },
    );
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "EarthDesign";
  workbook.created = new Date();
  workbook.properties.title = "EarthDesign data backup";

  const client = prisma as unknown as Record<PrismaModelName, PrismaDelegate>;

  for (const config of excelImportConfig) {
    const worksheet = workbook.addWorksheet(config.sheetName);
    const columns = backupColumns[config.model];
    const records = await client[config.model].findMany();

    worksheet.addRow(columns);
    for (const record of records) {
      worksheet.addRow(
        columns.map((field) => getBackupValue(config.model, field, record)),
      );
    }

    const header = worksheet.getRow(1);
    header.font = { bold: true, color: { argb: "FFFFFFFF" } };
    header.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF047857" },
    };
    header.alignment = { vertical: "middle" };
    worksheet.views = [{ state: "frozen", ySplit: 1 }];
    worksheet.autoFilter = {
      from: "A1",
      to: { row: 1, column: columns.length },
    };

    for (let index = 1; index <= columns.length; index++) {
      const column = worksheet.getColumn(index);
      column.width = Math.min(
        42,
        Math.max(12, String(columns[index - 1]).length + 2),
      );
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${backupFilename()}"`,
      "Cache-Control": "no-store",
    },
  });
}
