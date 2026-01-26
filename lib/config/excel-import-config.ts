// lib/config/excel-import-config.ts
import { Prisma } from "@prisma/client";
import { z } from "zod";

/* =========================================================
 * CONSTANTS & TYPES
 * ========================================================= */

export const PROPERTY_TYPES = [
  "Apartment",
  "House",
  "Villa",
  "Office",
  "Commercial",
  "Land",
  "Building",
  "Studio",
  "Duplex",
  "ChambreModerne",
  "Chambre",
] as const;

export const MEDIA_ENTITY_TYPES = [
  "PROPERTY",
  "LOTISSEMENT",
  "PARCELLE",
  "BATIMENT",
  "INFRASTRUCTURE",
] as const;

export type PropertyTypeValue = (typeof PROPERTY_TYPES)[number];
export type MediaEntityTypeValue = (typeof MEDIA_ENTITY_TYPES)[number];

export type PrismaModelName =
  | "route"
  | "riviere"
  | "equipement"
  | "infrastructure"
  | "borne"
  | "taxe_immobiliere"
  | "reseau_energetique"
  | "reseau_en_eau"
  | "region"
  | "departement"
  | "arrondissement"
  | "lotissement"
  | "parcelle"
  | "batiment"
  | "property"
  | "media"
  | "payer"
  | "limitrophe"
  | "alimenter"
  | "contenir"
  | "trouver"
  | "eclairer"
  | "desservir"
  | "approvisionner";

type ColumnMapper = (cellValue: unknown) => unknown;

export interface TransformContext {
  rowNumber: number;
  sheetName: string;
  addWarning: (message: string) => void;
  addError: (message: string) => void;
}

export interface TransformResult<T> {
  data: T | null;
  warning?: string;
}

export interface SheetConfig<T = Record<string, unknown>> {
  sheetName: string;
  model: PrismaModelName;
  columnCount: number;
  mappers: ColumnMapper[];
  transform: (mappedValues: unknown[], ctx?: TransformContext) => T | null;
  // Optional: Zod schema for validation
  schema?: z.ZodSchema<T>;
  // Optional: unique key for upsert operations
  uniqueKey?: string;
  // Optional: dependencies that must exist
  dependencies?: PrismaModelName[];
}

/* =========================================================
 * MAPPER FUNCTIONS
 * ========================================================= */

export const toStr = (v: unknown): string | null => {
  if (v === undefined || v === null || v === "") return null;
  return String(v).trim();
};

export const toNum = (v: unknown): number | null => {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
};

export const toInt = (v: unknown): number | null => {
  const n = toNum(v);
  return n !== null ? Math.floor(n) : null;
};

export const toBool = (v: unknown): boolean => {
  if (v === undefined || v === null || v === "") return false;
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const lower = v.toLowerCase().trim();
    return ["true", "1", "yes", "oui", "vrai"].includes(lower);
  }
  if (typeof v === "number") return v !== 0;
  return false;
};

export const toDate = (v: unknown): Date | null => {
  if (v === undefined || v === null || v === "") return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;

  // Handle Excel serial date numbers
  if (typeof v === "number") {
    // Excel dates are days since 1900-01-01 (with a bug for 1900 leap year)
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + v * 24 * 60 * 60 * 1000);
    return isNaN(date.getTime()) ? null : date;
  }

  const d = new Date(v as string);
  return isNaN(d.getTime()) ? null : d;
};

export const toDecimal = (v: unknown): Prisma.Decimal | null => {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  if (isNaN(n)) return null;
  return new Prisma.Decimal(n);
};

/* =========================================================
 * DEFAULT HELPER FUNCTIONS
 * ========================================================= */

export const defNum = (
  v: unknown,
  defaultValue: number | null = null,
): number | null => {
  const n = toNum(v);
  return n !== null ? n : defaultValue;
};

export const defInt = (
  v: unknown,
  defaultValue: number | null = null,
): number | null => {
  const n = toInt(v);
  return n !== null ? n : defaultValue;
};

export const defBool = (v: unknown, defaultValue = false): boolean => {
  if (v === undefined || v === "" || v === null) return defaultValue;
  return toBool(v);
};

export const defStr = (
  v: unknown,
  defaultValue: string | null = null,
): string | null => {
  const s = toStr(v);
  return s !== null ? s : defaultValue;
};

export const defDecimal = (
  v: unknown,
  defaultValue: Prisma.Decimal | null = null,
): Prisma.Decimal | null => {
  const d = toDecimal(v);
  return d !== null ? d : defaultValue;
};

export const defDate = (
  v: unknown,
  defaultValue: Date | null = null,
): Date | null => {
  const d = toDate(v);
  return d !== null ? d : defaultValue;
};

/* =========================================================
 * TYPE GUARDS
 * ========================================================= */

export const isValidPropertyType = (
  value: unknown,
): value is PropertyTypeValue => {
  return (
    typeof value === "string" &&
    PROPERTY_TYPES.includes(value as PropertyTypeValue)
  );
};

export const isValidMediaEntityType = (
  value: unknown,
): value is MediaEntityTypeValue => {
  return (
    typeof value === "string" &&
    MEDIA_ENTITY_TYPES.includes(value as MediaEntityTypeValue)
  );
};

// Check if ID is valid (not null, undefined, or explicitly checking for 0 if needed)
export const isValidId = (id: unknown, allowZero = false): id is number => {
  if (id === null || id === undefined) return false;
  const num = Number(id);
  if (isNaN(num)) return false;
  return allowZero ? true : num !== 0;
};

/* =========================================================
 * ZOD SCHEMAS (for critical tables)
 * ========================================================= */

const DecimalSchema = z
  .custom<Prisma.Decimal>(
    (val) => val === null || val instanceof Prisma.Decimal,
    { message: "Invalid decimal value" },
  )
  .nullable();

export const PropertySchema = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().min(1, "Title is required"),
  shortDescription: z.string().nullable(),
  description: z.string().nullable(),
  price: DecimalSchema,
  priceMin: DecimalSchema,
  priceMax: DecimalSchema,
  pricePerSqM: DecimalSchema,
  currency: z.string().default("XAF"),
  type: z.enum(PROPERTY_TYPES).default("House"),
  forSale: z.boolean().default(true),
  forRent: z.boolean().default(false),
  rentPrice: DecimalSchema,
  isLandForDevelopment: z.boolean().default(false),
  approvedForApartments: z.boolean().nullable(),
  bedrooms: z.number().int().nullable(),
  bathrooms: z.number().int().nullable(),
  kitchens: z.number().int().nullable(),
  livingRooms: z.number().int().nullable(),
  surfaceArea: z.number().nullable(),
  floorLevel: z.number().int().nullable(),
  totalFloors: z.number().int().nullable(),
  doorNumber: z.string().nullable(),
  hasGenerator: z.boolean().default(false),
  hasParking: z.boolean().default(false),
  parkingSpaces: z.number().int().nullable(),
  amenities: z.string().nullable(),
  address: z.string().nullable(),
  parcelleId: z.number().int().positive("parcelleId is required"),
  batimentId: z.number().int().positive().nullable(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
});

export const MediaSchema = z.object({
  id: z.number().int().positive().optional(),
  entityType: z.enum(MEDIA_ENTITY_TYPES),
  entityId: z.number().int().positive(),
  url: z.string().url("Invalid URL format"),
  type: z.string().default("image"),
  order: z.number().int().default(0),
  propertyId: z.number().int().positive().nullable().optional(),
  lotissementId: z.number().int().positive().nullable().optional(),
  parcelleId: z.number().int().positive().nullable().optional(),
  batimentId: z.number().int().positive().nullable().optional(),
  infrastructureId: z.number().int().positive().nullable().optional(),
});

/* =========================================================
 * SHEET CONFIGURATIONS
 * ========================================================= */

export const excelImportConfig: SheetConfig[] = [
  /* =========================================================
   * INDEPENDENT TABLES (no FK) - Import FIRST
   * ========================================================= */
  {
    sheetName: "Route",
    model: "route",
    columnCount: 7,
    uniqueKey: "Id_Rte",
    mappers: [toInt, toStr, toStr, toStr, toStr, toStr, toStr],
    transform: (row, ctx) => {
      const id = row[0] as number | null;
      if (!isValidId(id)) {
        ctx?.addWarning("Missing or invalid Id_Rte");
        return null;
      }
      return {
        Id_Rte: id,
        Cat_Rte: defStr(row[1]),
        Type_Rte: defStr(row[2]),
        Largeur_Rte: defStr(row[3]),
        Etat_Rte: defStr(row[4]),
        Mat_Rte: defStr(row[5]),
        WKT_Geometry: defStr(row[6]),
      };
    },
  },

  {
    sheetName: "Riviere",
    model: "riviere",
    columnCount: 6,
    uniqueKey: "Id_Riv",
    mappers: [toInt, toStr, toStr, toStr, toStr, toStr],
    transform: (row, ctx) => {
      const id = row[0] as number | null;
      if (!isValidId(id)) {
        ctx?.addWarning("Missing or invalid Id_Riv");
        return null;
      }
      return {
        Id_Riv: id,
        Nom_Riv: defStr(row[1]),
        Type_Riv: defStr(row[2]),
        Etat_amenag: defStr(row[3]),
        Debit_Riv: defStr(row[4]),
        WKT_Geometry: defStr(row[5]),
      };
    },
  },

  {
    sheetName: "Equipement",
    model: "equipement",
    columnCount: 6,
    uniqueKey: "Id_Equip",
    mappers: [toInt, toStr, toStr, toStr, toStr, toStr],
    transform: (row, ctx) => {
      const id = row[0] as number | null;
      if (!isValidId(id)) {
        ctx?.addWarning("Missing or invalid Id_Equip");
        return null;
      }
      return {
        Id_Equip: id,
        Type_Equip: defStr(row[1]),
        Design_Equip: defStr(row[2]),
        Etat_Equip: defStr(row[3]),
        Mat_Equip: defStr(row[4]),
        WKT_Geometry: defStr(row[5]),
      };
    },
  },

  {
    sheetName: "Infrastructure",
    model: "infrastructure",
    columnCount: 8,
    uniqueKey: "Id_Infras",
    mappers: [toInt, toStr, toStr, toStr, toStr, toStr, toStr, toStr],
    transform: (row, ctx) => {
      const id = row[0] as number | null;
      if (!isValidId(id)) {
        ctx?.addWarning("Missing or invalid Id_Infras");
        return null;
      }
      return {
        Id_Infras: id,
        Nom_infras: defStr(row[1]),
        Type_Infraas: defStr(row[2]),
        Categorie_infras: defStr(row[3]),
        Cycle: defStr(row[4]),
        Statut_infras: defStr(row[5]),
        Standing: defStr(row[6]),
        WKT_Geometry: defStr(row[7]),
      };
    },
  },

  {
    sheetName: "Borne",
    model: "borne",
    columnCount: 5,
    uniqueKey: "Id_Borne",
    mappers: [toInt, toNum, toNum, toNum, toStr],
    transform: (row, ctx) => {
      const id = row[0] as number | null;
      if (!isValidId(id)) {
        ctx?.addWarning("Missing or invalid Id_Borne");
        return null;
      }
      return {
        Id_Borne: id,
        coord_x: defNum(row[1]),
        coord_y: defNum(row[2]),
        coord_z: defNum(row[3]),
        WKT_Geometry: defStr(row[4]),
      };
    },
  },

  {
    sheetName: "Taxe_immobiliere",
    model: "taxe_immobiliere",
    columnCount: 8,
    uniqueKey: "Id_Taxe",
    mappers: [toInt, toStr, toStr, toStr, toNum, toBool, toDate, toStr],
    transform: (row, ctx) => {
      const id = row[0] as number | null;
      if (!isValidId(id)) {
        ctx?.addWarning("Missing or invalid Id_Taxe");
        return null;
      }
      return {
        Id_Taxe: id,
        Num_TF: defStr(row[1]),
        Nom_Proprio: defStr(row[2]),
        NIU: defStr(row[3]),
        Val_imm: defNum(row[4]),
        Taxe_Payee: defBool(row[5]),
        Date_declaree: defDate(row[6]),
        Type_taxe: defStr(row[7]),
      };
    },
  },

  {
    sheetName: "Reseau_energetique",
    model: "reseau_energetique",
    columnCount: 6,
    uniqueKey: "Id_Reseaux",
    mappers: [toInt, toInt, toStr, toStr, toStr, toStr],
    transform: (row, ctx) => {
      const id = row[0] as number | null;
      if (!isValidId(id)) {
        ctx?.addWarning("Missing or invalid Id_Reseaux");
        return null;
      }
      return {
        Id_Reseaux: id,
        Source_Res: defInt(row[1]),
        Type_Reseau: defStr(row[2]),
        Etat_Res: defStr(row[3]),
        Materiau: defStr(row[4]),
        WKT_Geometry: defStr(row[5]),
      };
    },
  },

  {
    sheetName: "Reseau_en_eau",
    model: "reseau_en_eau",
    columnCount: 6,
    uniqueKey: "Id_Reseaux",
    mappers: [toInt, toInt, toStr, toStr, toStr, toStr],
    transform: (row, ctx) => {
      const id = row[0] as number | null;
      if (!isValidId(id)) {
        ctx?.addWarning("Missing or invalid Id_Reseaux");
        return null;
      }
      return {
        Id_Reseaux: id,
        Source_Res: defInt(row[1]),
        Type_Res: defStr(row[2]),
        Etat_Res: defStr(row[3]),
        Mat_Res: defStr(row[4]),
        WKT_Geometry: defStr(row[5]),
      };
    },
  },

  /* =========================================================
   * HIERARCHICAL GEO (order matters: Region → Departement → Arrondissement)
   * ========================================================= */
  {
    sheetName: "Region",
    model: "region",
    columnCount: 5,
    uniqueKey: "Id_Reg",
    mappers: [toInt, toStr, toNum, toStr, toStr],
    transform: (row, ctx) => {
      const id = row[0] as number | null;
      if (!isValidId(id)) {
        ctx?.addWarning("Missing or invalid Id_Reg");
        return null;
      }
      return {
        Id_Reg: id,
        Nom_Reg: defStr(row[1]),
        Sup_Reg: defNum(row[2]),
        Chef_lieu_Reg: defStr(row[3]),
        WKT_Geometry: defStr(row[4]),
      };
    },
  },

  {
    sheetName: "Departement",
    model: "departement",
    columnCount: 6,
    uniqueKey: "Id_Dept",
    dependencies: ["region"],
    mappers: [toInt, toStr, toNum, toStr, toInt, toStr],
    transform: (row, ctx) => {
      const id = row[0] as number | null;
      if (!isValidId(id)) {
        ctx?.addWarning("Missing or invalid Id_Dept");
        return null;
      }
      return {
        Id_Dept: id,
        Nom_Dept: defStr(row[1]),
        Sup_Dept: defNum(row[2]),
        Chef_lieu_Dept: defStr(row[3]),
        Id_Reg: defInt(row[4]),
        WKT_Geometry: defStr(row[5]),
      };
    },
  },

  {
    sheetName: "Arrondissement",
    model: "arrondissement",
    columnCount: 7,
    uniqueKey: "Id_Arrond",
    dependencies: ["departement"],
    mappers: [toInt, toStr, toNum, toStr, toStr, toInt, toStr],
    transform: (row, ctx) => {
      const id = row[0] as number | null;
      if (!isValidId(id)) {
        ctx?.addWarning("Missing or invalid Id_Arrond");
        return null;
      }
      return {
        Id_Arrond: id,
        Nom_Arrond: defStr(row[1]),
        Sup_Arrond: defNum(row[2]),
        Chef_lieu_Arrond: defStr(row[3]),
        Commune: defStr(row[4]),
        Id_Dept: defInt(row[5]),
        WKT_Geometry: defStr(row[6]),
      };
    },
  },

  /* =========================================================
   * LOTISSEMENT (15 columns)
   * Depends on: Arrondissement
   * ========================================================= */
  {
    sheetName: "Lotissement",
    model: "lotissement",
    columnCount: 15,
    uniqueKey: "Id_Lotis",
    dependencies: ["arrondissement"],
    mappers: [
      toInt, // 0: Id_Lotis
      toStr, // 1: Nom_proprio
      toStr, // 2: Num_TF
      toStr, // 3: Statut
      toStr, // 4: Nom_cons
      toNum, // 5: Surface
      toStr, // 6: Nom_visa_lotis
      toDate, // 7: Date_approb
      toStr, // 8: Geo_exe
      toInt, // 9: Nbre_lots
      toStr, // 10: Lieudit
      toNum, // 11: Echelle
      toStr, // 12: Ccp
      toInt, // 13: Id_Arrond (FK)
      toStr, // 14: WKT_Geometry
    ],
    transform: (row, ctx) => {
      const id = row[0] as number | null;
      if (!isValidId(id)) {
        ctx?.addWarning("Missing or invalid Id_Lotis");
        return null;
      }
      return {
        Id_Lotis: id,
        Nom_proprio: defStr(row[1]),
        Num_TF: defStr(row[2]),
        Statut: defStr(row[3]),
        Nom_cons: defStr(row[4]),
        Surface: defNum(row[5]),
        Nom_visa_lotis: defStr(row[6]),
        Date_approb: defDate(row[7]),
        Geo_exe: defStr(row[8]),
        Nbre_lots: defInt(row[9]),
        Lieudit: defStr(row[10]),
        Echelle: defNum(row[11]),
        Ccp: defStr(row[12]),
        Id_Arrond: defInt(row[13]),
        WKT_Geometry: defStr(row[14]),
      };
    },
  },

  /* =========================================================
   * PARCELLE (21 columns)
   * Depends on: Lotissement
   * ========================================================= */
  {
    sheetName: "Parcelle",
    model: "parcelle",
    columnCount: 21,
    uniqueKey: "Id_Parcel",
    dependencies: ["lotissement"],
    mappers: [
      toInt, // 0: Id_Parcel
      toStr, // 1: Nom_Prop
      toStr, // 2: TF_Mere
      toStr, // 3: Mode_Obtent
      toStr, // 4: TF_Cree
      toStr, // 5: Nom_Cons
      toNum, // 6: Sup
      toStr, // 7: Nom_Visa_Cad
      toDate, // 8: Date_visa
      toStr, // 9: Geometre
      toDate, // 10: Date_impl
      toStr, // 11: Num_lot
      toStr, // 12: Num_bloc
      toStr, // 13: Lieu_dit
      toStr, // 14: Largeur_Rte
      toNum, // 15: Echelle
      toStr, // 16: Ccp_N
      toBool, // 17: Mise_Val
      toBool, // 18: Cloture
      toInt, // 19: Id_Lotis (FK)
      toStr, // 20: WKT_Geometry
    ],
    transform: (row, ctx) => {
      const id = row[0] as number | null;
      if (!isValidId(id)) {
        ctx?.addWarning("Missing or invalid Id_Parcel");
        return null;
      }
      return {
        Id_Parcel: id,
        Nom_Prop: defStr(row[1]),
        TF_Mere: defStr(row[2]),
        Mode_Obtent: defStr(row[3]),
        TF_Cree: defStr(row[4]),
        Nom_Cons: defStr(row[5]),
        Sup: defNum(row[6]),
        Nom_Visa_Cad: defStr(row[7]),
        Date_visa: defDate(row[8]),
        Geometre: defStr(row[9]),
        Date_impl: defDate(row[10]),
        Num_lot: defStr(row[11]),
        Num_bloc: defStr(row[12]),
        Lieu_dit: defStr(row[13]),
        Largeur_Rte: defStr(row[14]),
        Echelle: defNum(row[15]),
        Ccp_N: defStr(row[16]),
        Mise_Val: defBool(row[17]),
        Cloture: defBool(row[18]),
        Id_Lotis: defInt(row[19]),
        WKT_Geometry: defStr(row[20]),
      };
    },
  },

  /* =========================================================
   * BATIMENT (19 columns)
   * Depends on: Parcelle
   * ========================================================= */
  {
    sheetName: "Batiment",
    model: "batiment",
    columnCount: 19,
    uniqueKey: "Id_Bat",
    dependencies: ["parcelle"],
    mappers: [
      toInt, // 0: Id_Bat
      toStr, // 1: Type_Usage
      toStr, // 2: Cat_Bat
      toStr, // 3: Status
      toStr, // 4: Standing
      toBool, // 5: Cloture
      toStr, // 6: No_Permis
      toStr, // 7: Type_Lodg
      toStr, // 8: Etat_Bat
      toStr, // 9: Nom
      toStr, // 10: Mat_Bati
      toInt, // 11: totalFloors
      toInt, // 12: totalUnits
      toBool, // 13: hasElevator
      toNum, // 14: surfaceArea
      toStr, // 15: doorNumber
      toStr, // 16: address
      toInt, // 17: Id_Parcel (FK)
      toStr, // 18: WKT_Geometry
    ],
    transform: (row, ctx) => {
      const id = row[0] as number | null;
      if (!isValidId(id)) {
        ctx?.addWarning("Missing or invalid Id_Bat");
        return null;
      }
      return {
        Id_Bat: id,
        Type_Usage: defStr(row[1]),
        Cat_Bat: defStr(row[2]),
        Status: defStr(row[3]),
        Standing: defStr(row[4]),
        Cloture: defBool(row[5]),
        No_Permis: defStr(row[6]),
        Type_Lodg: defStr(row[7]),
        Etat_Bat: defStr(row[8]),
        Nom: defStr(row[9]),
        Mat_Bati: defStr(row[10]),
        totalFloors: defInt(row[11]),
        totalUnits: defInt(row[12]),
        hasElevator: defBool(row[13], false),
        surfaceArea: defNum(row[14]),
        doorNumber: defStr(row[15]),
        address: defStr(row[16]),
        Id_Parcel: defInt(row[17]),
        WKT_Geometry: defStr(row[18]),
      };
    },
  },

  /* =========================================================
   * PROPERTY (32 columns)
   * Depends on: Parcelle, Batiment (optional)
   * ========================================================= */
  {
    sheetName: "Property",
    model: "property",
    columnCount: 32,
    uniqueKey: "id",
    dependencies: ["parcelle", "batiment"],
    schema: PropertySchema,
    mappers: [
      toInt, // 0: id
      toStr, // 1: title
      toStr, // 2: shortDescription
      toStr, // 3: description
      toDecimal, // 4: price
      toDecimal, // 5: priceMin
      toDecimal, // 6: priceMax
      toDecimal, // 7: pricePerSqM
      toStr, // 8: currency
      toStr, // 9: type (PropertyType enum)
      toBool, // 10: forSale
      toBool, // 11: forRent
      toDecimal, // 12: rentPrice
      toBool, // 13: isLandForDevelopment
      toBool, // 14: approvedForApartments
      toInt, // 15: bedrooms
      toInt, // 16: bathrooms
      toInt, // 17: kitchens
      toInt, // 18: livingRooms
      toNum, // 19: surfaceArea
      toInt, // 20: floorLevel
      toInt, // 21: totalFloors
      toStr, // 22: doorNumber
      toBool, // 23: hasGenerator
      toBool, // 24: hasParking
      toInt, // 25: parkingSpaces
      toStr, // 26: amenities
      toStr, // 27: address
      toInt, // 28: parcelleId (REQUIRED)
      toInt, // 29: batimentId (optional)
      toBool, // 30: published
      toBool, // 31: featured
    ],
    transform: (row, ctx) => {
      // parcelleId is required
      const parcelleId = row[28] as number | null;
      if (!isValidId(parcelleId)) {
        ctx?.addWarning("Missing or invalid parcelleId (required)");
        return null;
      }

      // Validate PropertyType
      const rawType = row[9];
      if (rawType !== null && !isValidPropertyType(rawType)) {
        ctx?.addWarning(
          `Invalid PropertyType "${rawType}", defaulting to "House"`,
        );
      }

      // Only include batimentId if valid
      const batimentId = row[29] as number | null;
      const validBatimentId = isValidId(batimentId) ? batimentId : null;

      // ID is optional - will auto-generate if not provided
      const id = row[0] as number | null;

      return {
        ...(isValidId(id) ? { id } : {}),
        title: defStr(row[1], "Untitled Property") as string,
        shortDescription: defStr(row[2]),
        description: defStr(row[3]),
        price: defDecimal(row[4]),
        priceMin: defDecimal(row[5]),
        priceMax: defDecimal(row[6]),
        pricePerSqM: defDecimal(row[7]),
        currency: defStr(row[8], "XAF"),
        type: isValidPropertyType(rawType) ? rawType : "House",
        forSale: defBool(row[10], true),
        forRent: defBool(row[11], false),
        rentPrice: defDecimal(row[12]),
        isLandForDevelopment: defBool(row[13], false),
        approvedForApartments: defBool(row[14]) || null,
        bedrooms: defInt(row[15]),
        bathrooms: defInt(row[16]),
        kitchens: defInt(row[17]),
        livingRooms: defInt(row[18]),
        surfaceArea: defNum(row[19]),
        floorLevel: defInt(row[20]),
        totalFloors: defInt(row[21]),
        doorNumber: defStr(row[22]),
        hasGenerator: defBool(row[23], false),
        hasParking: defBool(row[24], false),
        parkingSpaces: defInt(row[25]),
        amenities: defStr(row[26]),
        address: defStr(row[27]),
        parcelleId,
        batimentId: validBatimentId,
        published: defBool(row[30], false),
        featured: defBool(row[31], false),
      };
    },
  },

  /* =========================================================
   * MEDIA (6 columns)
   * Depends on: Property, Lotissement, Parcelle, Batiment, Infrastructure
   * ========================================================= */
  {
    sheetName: "Media",
    model: "media",
    columnCount: 6,
    schema: MediaSchema,
    mappers: [toInt, toStr, toInt, toStr, toStr, toInt],
    transform: (row, ctx) => {
      const entityType = row[1] as string | null;
      const entityId = row[2] as number | null;
      const url = row[3] as string | null;

      // Validate required fields
      if (!entityType) {
        ctx?.addWarning("Missing entityType");
        return null;
      }
      if (!isValidId(entityId)) {
        ctx?.addWarning("Missing or invalid entityId");
        return null;
      }
      if (!url || url.trim() === "") {
        ctx?.addWarning("Missing URL");
        return null;
      }

      if (!isValidMediaEntityType(entityType)) {
        ctx?.addWarning(`Invalid entityType "${entityType}"`);
        return null;
      }

      const id = row[0] as number | null;

      // Build result with appropriate FK based on entityType
      const result: Record<string, unknown> = {
        ...(isValidId(id) ? { id } : {}),
        entityType,
        entityId,
        url: url.trim(),
        type: defStr(row[4], "image"),
        order: defInt(row[5], 0),
      };

      // Set the polymorphic FK based on entityType
      const fkMap: Record<MediaEntityTypeValue, string> = {
        PROPERTY: "propertyId",
        LOTISSEMENT: "lotissementId",
        PARCELLE: "parcelleId",
        BATIMENT: "batimentId",
        INFRASTRUCTURE: "infrastructureId",
      };

      const fkField = fkMap[entityType];
      if (fkField) {
        result[fkField] = entityId;
      }

      return result;
    },
  },

  /* =========================================================
   * RELATIONSHIP TABLES (Junction tables)
   * ========================================================= */
  {
    sheetName: "Payer",
    model: "payer",
    columnCount: 4,
    dependencies: ["parcelle", "batiment", "taxe_immobiliere"],
    mappers: [toInt, toInt, toInt, toInt], // Fixed: date_paye should be date
    transform: (row, ctx) => {
      const idParcel = row[0] as number | null;
      const idBat = row[1] as number | null;
      const idTaxe = row[2] as number | null;

      if (!isValidId(idParcel) || !isValidId(idBat) || !isValidId(idTaxe)) {
        ctx?.addWarning("Missing required FK (Id_Parcel, Id_Bat, or Id_Taxe)");
        return null;
      }

      return {
        Id_Parcel: idParcel,
        Id_Bat: idBat,
        Id_Taxe: idTaxe,
        date_paye: defInt(row[3]),
      };
    },
  },

  {
    sheetName: "Limitrophe",
    model: "limitrophe",
    columnCount: 2,
    dependencies: ["lotissement", "riviere"],
    mappers: [toInt, toInt],
    transform: (row, ctx) => {
      const idLotis = row[0] as number | null;
      const idRiv = row[1] as number | null;

      if (!isValidId(idLotis) || !isValidId(idRiv)) {
        ctx?.addWarning("Missing required FK (Id_Lotis or Id_Riv)");
        return null;
      }
      return { Id_Lotis: idLotis, Id_Riv: idRiv };
    },
  },

  {
    sheetName: "Alimenter",
    model: "alimenter",
    columnCount: 2,
    dependencies: ["batiment", "reseau_en_eau"], // Water network
    mappers: [toInt, toInt],
    transform: (row, ctx) => {
      const idBat = row[0] as number | null;
      const idReseaux = row[1] as number | null;

      if (!isValidId(idBat) || !isValidId(idReseaux)) {
        ctx?.addWarning("Missing required FK (Id_Bat or Id_Reseaux)");
        return null;
      }
      return { Id_Bat: idBat, Id_Reseaux: idReseaux };
    },
  },

  {
    sheetName: "Contenir",
    model: "contenir",
    columnCount: 2,
    dependencies: ["parcelle", "borne"],
    mappers: [toInt, toInt],
    transform: (row, ctx) => {
      const idParcel = row[0] as number | null;
      const idBorne = row[1] as number | null;

      if (!isValidId(idParcel) || !isValidId(idBorne)) {
        ctx?.addWarning("Missing required FK (Id_Parcel or Id_Borne)");
        return null;
      }
      return { Id_Parcel: idParcel, Id_Borne: idBorne };
    },
  },

  {
    sheetName: "Trouver",
    model: "trouver",
    columnCount: 2,
    dependencies: ["parcelle", "infrastructure"],
    mappers: [toInt, toInt],
    transform: (row, ctx) => {
      const idParcel = row[0] as number | null;
      const idInfras = row[1] as number | null;

      if (!isValidId(idParcel) || !isValidId(idInfras)) {
        ctx?.addWarning("Missing required FK (Id_Parcel or Id_Infras)");
        return null;
      }
      return { Id_Parcel: idParcel, Id_Infras: idInfras };
    },
  },

  {
    sheetName: "Eclairer",
    model: "eclairer",
    columnCount: 2,
    dependencies: ["parcelle", "equipement"],
    mappers: [toInt, toInt],
    transform: (row, ctx) => {
      const idParcel = row[0] as number | null;
      const idEquip = row[1] as number | null;

      if (!isValidId(idParcel) || !isValidId(idEquip)) {
        ctx?.addWarning("Missing required FK (Id_Parcel or Id_Equip)");
        return null;
      }
      return { Id_Parcel: idParcel, Id_Equip: idEquip };
    },
  },

  {
    sheetName: "Desservir",
    model: "desservir",
    columnCount: 2,
    dependencies: ["parcelle", "route"],
    mappers: [toInt, toInt],
    transform: (row, ctx) => {
      const idParcel = row[0] as number | null;
      const idRte = row[1] as number | null;

      if (!isValidId(idParcel) || !isValidId(idRte)) {
        ctx?.addWarning("Missing required FK (Id_Parcel or Id_Rte)");
        return null;
      }
      return { Id_Parcel: idParcel, Id_Rte: idRte };
    },
  },

  {
    sheetName: "Approvisionner",
    model: "approvisionner",
    columnCount: 2,
    dependencies: ["batiment", "reseau_energetique"], // Energy network (different from Alimenter)
    mappers: [toInt, toInt],
    transform: (row, ctx) => {
      const idBat = row[0] as number | null;
      const idReseaux = row[1] as number | null;

      if (!isValidId(idBat) || !isValidId(idReseaux)) {
        ctx?.addWarning("Missing required FK (Id_Bat or Id_Reseaux)");
        return null;
      }
      return { Id_Bat: idBat, Id_Reseaux: idReseaux };
    },
  },
];

/* =========================================================
 * HELPER: Get sheets by category
 * ========================================================= */

export const OPTIONAL_SHEETS = [
  "Payer",
  "Limitrophe",
  "Alimenter",
  "Contenir",
  "Trouver",
  "Eclairer",
  "Desservir",
  "Approvisionner",
  "Media",
];

export const getRequiredSheets = (): string[] => {
  return excelImportConfig
    .filter((config) => !OPTIONAL_SHEETS.includes(config.sheetName))
    .map((config) => config.sheetName);
};

export const getSheetConfig = (sheetName: string): SheetConfig | undefined => {
  return excelImportConfig.find((config) => config.sheetName === sheetName);
};
