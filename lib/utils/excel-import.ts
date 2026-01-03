// lib/utils/excel-import.ts
import type { CellValue } from 'exceljs';

export const toStr = (val: CellValue): string | null => {
  if (val == null) return null;
  if (typeof val === 'string') return val.trim() || null;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (val instanceof Date) return val.toISOString();
  if (typeof val === 'object' && val !== null) {
    // Hyperlink or rich text
    if ('text' in val && typeof (val as any).text === 'string') {
      return (val as any).text.trim() || null;
    }
    // Formula result
    if ('result' in val) {
      return String((val as any).result).trim() || null;
    }
  }
  return String(val).trim() || null;
};

export const toNum = (val: CellValue): number | null => {
  if (val == null) return null;
  if (typeof val === 'number') return val;
  
  let numStr = '';
  if (typeof val === 'string') {
    numStr = val.trim();
  } else if (typeof val === 'object' && val !== null && 'result' in val) {
    numStr = String((val as any).result);
  } else {
    numStr = String(val);
  }
  
  if (!numStr) return null;
  const num = Number(numStr);
  return isNaN(num) ? null : num;
};

// NEW: Dedicated function for Decimal fields (prices)
export const toDecimal = (val: CellValue): number | null => {
  const num = toNum(val);
  if (num == null) return null;
  // Round to 2 decimal places for consistency with Decimal(15, 2)
  return Math.round(num * 100) / 100;
};

export const toBool = (val: CellValue): boolean | null => {
  if (val == null) return null;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val !== 0;
  if (typeof val === 'string') {
    const lower = val.toLowerCase().trim();
    if (['true', '1', 'yes', 'vrai', 'oui', 'o', 'ooui'].includes(lower)) return true;
    if (['false', '0', 'no', 'faux', 'non', 'n'].includes(lower)) return false;
  }
  return null;
};

export const toDate = (val: CellValue): Date | null => {
  if (val == null) return null;
  if (val instanceof Date) return val;
  
  if (typeof val === 'number') {
    // Excel serial date → JavaScript Date (Excel epoch: 1899-12-30)
    const utcDays = Math.floor(val - 25569);
    const date = new Date(utcDays * 86400 * 1000);
    return isNaN(date.getTime()) ? null : date;
  }
  
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return null;
    const date = new Date(trimmed);
    return isNaN(date.getTime()) ? null : date;
  }
  
  return null;
};

// Optional generic mapper
export const mapRow = <T extends { id: number }>(
  rowNumber: number,
  values: CellValue[],
  mappers: ((cellValue: CellValue) => any)[]
): T | null => {
  if (values.length < mappers.length) {
    console.warn(`Row ${rowNumber}: insufficient columns`);
    return null;
  }
  
  const mapped = mappers.map((mapper, i) => mapper(values[i]));
  const id = mapped[0];
  
  if (typeof id !== 'number' || id == null) {
    console.warn(`Skipping row ${rowNumber}: invalid or missing ID`);
    return null;
  }
  
  const entries = mapped.slice(1).map((value, i) => [`field_${i + 1}`, value]);
  return { id, ...Object.fromEntries(entries) } as T;
};