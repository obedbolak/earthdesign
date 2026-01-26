// lib/utils/excel-import.ts
import type { CellValue } from "exceljs";
import { Prisma } from "@prisma/client";

export const toStr = (val: CellValue): string | null => {
  if (val == null) return null;
  if (typeof val === "string") return val.trim() || null;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (val instanceof Date) return val.toISOString();
  if (typeof val === "object" && val !== null) {
    if ("text" in val && typeof (val as any).text === "string") {
      return (val as any).text.trim() || null;
    }
    if ("result" in val) {
      return String((val as any).result).trim() || null;
    }
  }
  return String(val).trim() || null;
};

export const toNum = (val: CellValue): number | null => {
  if (val == null) return null;
  if (typeof val === "number") return val;

  let numStr = "";
  if (typeof val === "string") {
    numStr = val.trim();
  } else if (typeof val === "object" && val !== null && "result" in val) {
    numStr = String((val as any).result);
  } else {
    numStr = String(val);
  }

  if (!numStr) return null;
  const num = Number(numStr);
  return isNaN(num) ? null : num;
};

// FIXED: Returns Prisma.Decimal to match schema
export const toDecimal = (val: CellValue): Prisma.Decimal | null => {
  const num = toNum(val);
  if (num == null) return null;
  return new Prisma.Decimal(num);
};

// FIXED: Returns boolean (never null) to match config behavior
export const toBool = (val: CellValue): boolean => {
  if (val == null) return false;
  if (typeof val === "boolean") return val;
  if (typeof val === "number") return val !== 0;
  if (typeof val === "string") {
    const lower = val.toLowerCase().trim();
    if (["true", "1", "yes", "vrai", "oui", "o"].includes(lower)) return true;
  }
  return false;
};

export const toDate = (val: CellValue): Date | null => {
  if (val == null) return null;
  if (val instanceof Date) return val;

  if (typeof val === "number") {
    const utcDays = Math.floor(val - 25569);
    const date = new Date(utcDays * 86400 * 1000);
    return isNaN(date.getTime()) ? null : date;
  }

  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return null;
    const date = new Date(trimmed);
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
};
