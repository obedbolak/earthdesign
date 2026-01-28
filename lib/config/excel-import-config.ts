// lib/config/excel-import-config.ts
import { Prisma } from "@prisma/client";
import { z } from "zod";

/* =========================================================
 * CONSTANTS & TYPES
 * ========================================================= */

export const PROPERTY_TYPES = [
  "APARTMENT",
  "HOUSE",
  "VILLA",
  "STUDIO",
  "DUPLEX",
  "TRIPLEX",
  "PENTHOUSE",
  "CHAMBRE_MODERNE",
  "CHAMBRE",
  "OFFICE",
  "SHOP",
  "RESTAURANT",
  "HOTEL",
  "WAREHOUSE",
  "COMMERCIAL_SPACE",
  "INDUSTRIAL",
  "FACTORY",
  "BUILDING",
  "MIXED_USE",
] as const;

export const PROPERTY_CATEGORIES = [
  "LAND",
  "RESIDENTIAL",
  "COMMERCIAL",
  "INDUSTRIAL",
  "MIXED",
] as const;

export const LISTING_TYPES = ["SALE", "RENT", "BOTH"] as const;

export const LISTING_STATUS = [
  "DRAFT",
  "PUBLISHED",
  "SOLD",
  "RENTED",
  "ARCHIVED",
] as const;

export const MEDIA_ENTITY_TYPES = [
  "LOTISSEMENT",
  "PARCELLE",
  "BATIMENT",
  "INFRASTRUCTURE",
] as const;

export const ENTITY_TYPES = ["LOTISSEMENT", "PARCELLE", "BATIMENT"] as const;

export type PropertyTypeValue = (typeof PROPERTY_TYPES)[number];
export type PropertyCategoryValue = (typeof PROPERTY_CATEGORIES)[number];
export type ListingTypeValue = (typeof LISTING_TYPES)[number];
export type ListingStatusValue = (typeof LISTING_STATUS)[number];
export type MediaEntityTypeValue = (typeof MEDIA_ENTITY_TYPES)[number];
export type EntityTypeValue = (typeof ENTITY_TYPES)[number];

// PrismaModelName - matches Prisma client accessor names (camelCase)
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

// Composite key type for junction tables
export type CompositeKey = {
  fields: string[];
};

export interface SheetConfig<T = Record<string, unknown>> {
  sheetName: string;
  model: PrismaModelName;
  columnCount: number;
  mappers: ColumnMapper[];
  transform: (mappedValues: unknown[], ctx?: TransformContext) => T | null;
  schema?: z.ZodSchema<T>;
  uniqueKey?: string;
  compositeKey?: CompositeKey;
  primaryKey?: string;
  dependencies?: PrismaModelName[];
}

/* =========================================================
 * FOREIGN KEY CONFIGURATION
 * ========================================================= */

export interface ForeignKeyConfig {
  field: string;
  referencedModel: PrismaModelName;
  referencedField: string;
  required: boolean;
}

export const FOREIGN_KEY_MAP: Record<PrismaModelName, ForeignKeyConfig[]> = {
  // Independent tables (no FKs)
  route: [],
  riviere: [],
  equipement: [],
  infrastructure: [],
  borne: [],
  taxe_immobiliere: [],
  reseau_energetique: [],
  reseau_en_eau: [],
  region: [],

  // Hierarchical geo tables - FKs are OPTIONAL per Prisma schema
  departement: [
    {
      field: "Id_Reg",
      referencedModel: "region",
      referencedField: "Id_Reg",
      required: false, // Prisma: Id_Reg Int?
    },
  ],
  arrondissement: [
    {
      field: "Id_Dept",
      referencedModel: "departement",
      referencedField: "Id_Dept",
      required: false, // Prisma: Id_Dept Int?
    },
  ],
  lotissement: [
    {
      field: "Id_Arrond",
      referencedModel: "arrondissement",
      referencedField: "Id_Arrond",
      required: false, // Prisma: Id_Arrond Int?
    },
  ],
  parcelle: [
    {
      field: "Id_Lotis",
      referencedModel: "lotissement",
      referencedField: "Id_Lotis",
      required: false, // Prisma: Id_Lotis Int?
    },
  ],
  batiment: [
    {
      field: "Id_Parcel",
      referencedModel: "parcelle",
      referencedField: "Id_Parcel",
      required: false, // Prisma: Id_Parcel Int?
    },
  ],

  // Media - FKs are optional
  media: [
    {
      field: "lotissementId",
      referencedModel: "lotissement",
      referencedField: "Id_Lotis",
      required: false,
    },
    {
      field: "parcelleId",
      referencedModel: "parcelle",
      referencedField: "Id_Parcel",
      required: false,
    },
    {
      field: "batimentId",
      referencedModel: "batiment",
      referencedField: "Id_Bat",
      required: false,
    },
    {
      field: "infrastructureId",
      referencedModel: "infrastructure",
      referencedField: "Id_Infras",
      required: false,
    },
  ],

  // Junction tables - ALL FKs are required (they form composite PK)
  payer: [
    {
      field: "Id_Parcel",
      referencedModel: "parcelle",
      referencedField: "Id_Parcel",
      required: true,
    },
    {
      field: "Id_Bat",
      referencedModel: "batiment",
      referencedField: "Id_Bat",
      required: true,
    },
    {
      field: "Id_Taxe",
      referencedModel: "taxe_immobiliere",
      referencedField: "Id_Taxe",
      required: true,
    },
  ],
  limitrophe: [
    {
      field: "Id_Lotis",
      referencedModel: "lotissement",
      referencedField: "Id_Lotis",
      required: true,
    },
    {
      field: "Id_Riv",
      referencedModel: "riviere",
      referencedField: "Id_Riv",
      required: true,
    },
  ],
  alimenter: [
    {
      field: "Id_Bat",
      referencedModel: "batiment",
      referencedField: "Id_Bat",
      required: true,
    },
    {
      field: "Id_Reseaux",
      referencedModel: "reseau_energetique",
      referencedField: "Id_Reseaux",
      required: true,
    },
  ],
  contenir: [
    {
      field: "Id_Parcel",
      referencedModel: "parcelle",
      referencedField: "Id_Parcel",
      required: true,
    },
    {
      field: "Id_Borne",
      referencedModel: "borne",
      referencedField: "Id_Borne",
      required: true,
    },
  ],
  trouver: [
    {
      field: "Id_Parcel",
      referencedModel: "parcelle",
      referencedField: "Id_Parcel",
      required: true,
    },
    {
      field: "Id_Infras",
      referencedModel: "infrastructure",
      referencedField: "Id_Infras",
      required: true,
    },
  ],
  eclairer: [
    {
      field: "Id_Parcel",
      referencedModel: "parcelle",
      referencedField: "Id_Parcel",
      required: true,
    },
    {
      field: "Id_Equip",
      referencedModel: "equipement",
      referencedField: "Id_Equip",
      required: true,
    },
  ],
  desservir: [
    {
      field: "Id_Parcel",
      referencedModel: "parcelle",
      referencedField: "Id_Parcel",
      required: true,
    },
    {
      field: "Id_Rte",
      referencedModel: "route",
      referencedField: "Id_Rte",
      required: true,
    },
  ],
  approvisionner: [
    {
      field: "Id_Bat",
      referencedModel: "batiment",
      referencedField: "Id_Bat",
      required: true,
    },
    {
      field: "Id_Reseaux",
      referencedModel: "reseau_en_eau",
      referencedField: "Id_Reseaux",
      required: true,
    },
  ],
};

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

  if (typeof v === "number") {
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

export const isValidPropertyCategory = (
  value: unknown,
): value is PropertyCategoryValue => {
  return (
    typeof value === "string" &&
    PROPERTY_CATEGORIES.includes(value as PropertyCategoryValue)
  );
};

export const isValidListingType = (
  value: unknown,
): value is ListingTypeValue => {
  return (
    typeof value === "string" &&
    LISTING_TYPES.includes(value as ListingTypeValue)
  );
};

export const isValidListingStatus = (
  value: unknown,
): value is ListingStatusValue => {
  return (
    typeof value === "string" &&
    LISTING_STATUS.includes(value as ListingStatusValue)
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

export const isValidId = (id: unknown, allowZero = false): id is number => {
  if (id === null || id === undefined) return false;
  const num = Number(id);
  if (isNaN(num)) return false;
  return allowZero ? true : num !== 0;
};

/* =========================================================
 * ZOD SCHEMAS
 * ========================================================= */

const DecimalSchema = z
  .custom<Prisma.Decimal>(
    (val) => val === null || val instanceof Prisma.Decimal,
    { message: "Invalid decimal value" },
  )
  .nullable();

export const LotissementSchema = z.object({
  Id_Lotis: z.number().int().positive().optional(),
  Nom_proprio: z.string().nullable(),
  Num_TF: z.string().nullable(),
  Statut: z.string().nullable(),
  Surface: z.number().nullable(),
  Id_Arrond: z.number().int().nullable(),
  slug: z.string().nullable(),
  title: z.string().nullable(),
  shortDescription: z.string().nullable(),
  description: z.string().nullable(),
  category: z.enum(PROPERTY_CATEGORIES).default("LAND"),
  listingType: z.enum(LISTING_TYPES).nullable(),
  listingStatus: z.enum(LISTING_STATUS).default("DRAFT"),
  price: DecimalSchema,
  pricePerSqM: DecimalSchema,
  currency: z.string().default("XAF"),
  featured: z.boolean().default(false),
  createdById: z.string().nullable(),
});

export const ParcelleSchema = z.object({
  Id_Parcel: z.number().int().positive().optional(),
  Nom_Prop: z.string().nullable(),
  TF_Cree: z.string().nullable(),
  Sup: z.number().nullable(),
  Id_Lotis: z.number().int().nullable(),
  slug: z.string().nullable(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  category: z.enum(PROPERTY_CATEGORIES).default("LAND"),
  listingType: z.enum(LISTING_TYPES).nullable(),
  listingStatus: z.enum(LISTING_STATUS).default("DRAFT"),
  price: DecimalSchema,
  createdById: z.string().nullable(),
});

export const BatimentSchema = z.object({
  Id_Bat: z.number().int().positive().optional(),
  propertyType: z.enum(PROPERTY_TYPES).nullable(),
  Id_Parcel: z.number().int().nullable(),
  slug: z.string().nullable(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  category: z.enum(PROPERTY_CATEGORIES).default("RESIDENTIAL"),
  listingType: z.enum(LISTING_TYPES).nullable(),
  listingStatus: z.enum(LISTING_STATUS).default("DRAFT"),
  price: DecimalSchema,
  rentPrice: DecimalSchema,
  bedrooms: z.number().int().nullable(),
  bathrooms: z.number().int().nullable(),
  surfaceArea: z.number().nullable(),
  createdById: z.string().nullable(),
});

export const MediaSchema = z.object({
  id: z.number().int().positive().optional(),
  entityType: z.enum(MEDIA_ENTITY_TYPES),
  url: z.string().url("Invalid URL format"),
  type: z.string().default("image"),
  order: z.number().int().default(0),
  caption: z.string().nullable(),
  isPrimary: z.boolean().default(false),
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
   * INDEPENDENT TABLES (no FK)
   * ========================================================= */
  {
    sheetName: "Route",
    model: "route",
    columnCount: 7,
    uniqueKey: "Id_Rte",
    primaryKey: "Id_Rte",
    mappers: [toInt, toStr, toStr, toStr, toStr, toStr, toStr],
    transform: (row, ctx) => {
      const id = row[0] as number | null;
      if (!isValidId(id)) {
        ctx?.addError("Missing or invalid Id_Rte");
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
    primaryKey: "Id_Riv",
    mappers: [toInt, toStr, toStr, toStr, toStr, toStr],
    transform: (row, ctx) => {
      const id = row[0] as number | null;
      if (!isValidId(id)) {
        ctx?.addError("Missing or invalid Id_Riv");
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
    primaryKey: "Id_Equip",
    mappers: [toInt, toStr, toStr, toStr, toStr, toStr],
    transform: (row, ctx) => {
      const id = row[0] as number | null;
      if (!isValidId(id)) {
        ctx?.addError("Missing or invalid Id_Equip");
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
    primaryKey: "Id_Infras",
    mappers: [toInt, toStr, toStr, toStr, toStr, toStr, toStr, toStr],
    transform: (row, ctx) => {
      const id = row[0] as number | null;
      if (!isValidId(id)) {
        ctx?.addError("Missing or invalid Id_Infras");
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
    primaryKey: "Id_Borne",
    mappers: [toInt, toNum, toNum, toNum, toStr],
    transform: (row, ctx) => {
      const id = row[0] as number | null;
      if (!isValidId(id)) {
        ctx?.addError("Missing or invalid Id_Borne");
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
    primaryKey: "Id_Taxe",
    mappers: [toInt, toStr, toStr, toStr, toNum, toBool, toDate, toStr],
    transform: (row, ctx) => {
      const id = row[0] as number | null;
      if (!isValidId(id)) {
        ctx?.addError("Missing or invalid Id_Taxe");
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
    primaryKey: "Id_Reseaux",
    mappers: [toInt, toNum, toStr, toStr, toStr, toStr],
    transform: (row, ctx) => {
      const id = row[0] as number | null;
      if (!isValidId(id)) {
        ctx?.addError("Missing or invalid Id_Reseaux");
        return null;
      }
      return {
        Id_Reseaux: id,
        Source_Res: defNum(row[1]),
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
    primaryKey: "Id_Reseaux",
    mappers: [toInt, toNum, toStr, toStr, toStr, toStr],
    transform: (row, ctx) => {
      const id = row[0] as number | null;
      if (!isValidId(id)) {
        ctx?.addError("Missing or invalid Id_Reseaux");
        return null;
      }
      return {
        Id_Reseaux: id,
        Source_Res: defNum(row[1]),
        Type_Res: defStr(row[2]),
        Etat_Res: defStr(row[3]),
        Mat_Res: defStr(row[4]),
        WKT_Geometry: defStr(row[5]),
      };
    },
  },

  /* =========================================================
   * HIERARCHICAL GEO
   * ========================================================= */
  {
    sheetName: "Region",
    model: "region",
    columnCount: 5,
    uniqueKey: "Id_Reg",
    primaryKey: "Id_Reg",
    mappers: [toInt, toStr, toNum, toStr, toStr],
    transform: (row, ctx) => {
      const id = row[0] as number | null;
      if (!isValidId(id)) {
        ctx?.addError("Missing or invalid Id_Reg");
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
    primaryKey: "Id_Dept",
    dependencies: ["region"],
    mappers: [toInt, toStr, toNum, toStr, toInt, toStr],
    transform: (row, ctx) => {
      const id = row[0] as number | null;
      if (!isValidId(id)) {
        ctx?.addError("Missing or invalid Id_Dept");
        return null;
      }

      // Id_Reg is OPTIONAL per Prisma schema
      const idReg = defInt(row[4]);

      return {
        Id_Dept: id,
        Nom_Dept: defStr(row[1]),
        Sup_Dept: defNum(row[2]),
        Chef_lieu_Dept: defStr(row[3]),
        Id_Reg: isValidId(idReg) ? idReg : null,
        WKT_Geometry: defStr(row[5]),
      };
    },
  },

  {
    sheetName: "Arrondissement",
    model: "arrondissement",
    columnCount: 7,
    uniqueKey: "Id_Arrond",
    primaryKey: "Id_Arrond",
    dependencies: ["departement"],
    mappers: [toInt, toStr, toNum, toStr, toStr, toInt, toStr],
    transform: (row, ctx) => {
      const id = row[0] as number | null;
      if (!isValidId(id)) {
        ctx?.addError("Missing or invalid Id_Arrond");
        return null;
      }

      // Id_Dept is OPTIONAL per Prisma schema
      const idDept = defInt(row[5]);

      return {
        Id_Arrond: id,
        Nom_Arrond: defStr(row[1]),
        Sup_Arrond: defNum(row[2]),
        Chef_lieu_Arrond: defStr(row[3]),
        Commune: defStr(row[4]),
        Id_Dept: isValidId(idDept) ? idDept : null,
        WKT_Geometry: defStr(row[6]),
      };
    },
  },

  /* =========================================================
   * LOTISSEMENT
   * Columns: 0-14 cadastral, 15-31 listing fields
   * Fixed: Echelle now uses toInt (Prisma: Int?)
   * ========================================================= */
  {
    sheetName: "Lotissement",
    model: "lotissement",
    columnCount: 32,
    uniqueKey: "Id_Lotis",
    primaryKey: "Id_Lotis",
    dependencies: ["arrondissement"],
    mappers: [
      toInt, // 0: Id_Lotis
      toStr, // 1: Nom_proprio
      toStr, // 2: Num_TF
      toStr, // 3: Statut
      toStr, // 4: Nom_cons
      toNum, // 5: Surface (Float?)
      toStr, // 6: Nom_visa_lotis
      toDate, // 7: Date_approb
      toStr, // 8: Geo_exe
      toInt, // 9: Nbre_lots (Int?)
      toStr, // 10: Lieudit
      toInt, // 11: Echelle (Int?) - FIXED: was toNum
      toStr, // 12: Ccp
      toInt, // 13: Id_Arrond
      toStr, // 14: WKT_Geometry
      toStr, // 15: slug
      toStr, // 16: title
      toStr, // 17: shortDescription
      toStr, // 18: description
      toStr, // 19: category
      toStr, // 20: listingType
      toStr, // 21: listingStatus
      toDecimal, // 22: price
      toDecimal, // 23: pricePerSqM
      toStr, // 24: currency
      toBool, // 25: featured
      toInt, // 26: totalParcels
      toInt, // 27: availableParcels
      toBool, // 28: hasRoadAccess
      toBool, // 29: hasElectricity
      toBool, // 30: hasWater
      toStr, // 31: createdById
    ],
    transform: (row, ctx) => {
      const id = row[0] as number | null;
      if (!isValidId(id)) {
        ctx?.addError("Missing or invalid Id_Lotis");
        return null;
      }

      const idArrond = defInt(row[13]);

      const rawCategory = row[19] as string | null;
      const category = isValidPropertyCategory(rawCategory)
        ? rawCategory
        : "LAND";

      const rawListingType = row[20] as string | null;
      const listingType = isValidListingType(rawListingType)
        ? rawListingType
        : null;

      const rawStatus = row[21] as string | null;
      const listingStatus = isValidListingStatus(rawStatus)
        ? rawStatus
        : "DRAFT";

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
        Echelle: defInt(row[11]), // FIXED: was defNum
        Ccp: defStr(row[12]),
        Id_Arrond: isValidId(idArrond) ? idArrond : null,
        WKT_Geometry: defStr(row[14]),
        slug: defStr(row[15]),
        title: defStr(row[16]),
        shortDescription: defStr(row[17]),
        description: defStr(row[18]),
        category,
        listingType,
        listingStatus,
        price: defDecimal(row[22]),
        pricePerSqM: defDecimal(row[23]),
        currency: defStr(row[24], "XAF"),
        featured: defBool(row[25], false),
        totalParcels: defInt(row[26]),
        availableParcels: defInt(row[27]),
        hasRoadAccess: defBool(row[28], false),
        hasElectricity: defBool(row[29], false),
        hasWater: defBool(row[30], false),
        createdById: defStr(row[31]),
      };
    },
  },

  /* =========================================================
   * PARCELLE
   * Fixed: Echelle now uses toInt (Prisma: Int?)
   * ========================================================= */
  {
    sheetName: "Parcelle",
    model: "parcelle",
    columnCount: 34,
    uniqueKey: "Id_Parcel",
    primaryKey: "Id_Parcel",
    dependencies: ["lotissement"],
    mappers: [
      toInt, // 0: Id_Parcel
      toStr, // 1: Nom_Prop
      toStr, // 2: TF_Mere
      toStr, // 3: Mode_Obtent
      toStr, // 4: TF_Cree
      toStr, // 5: Nom_Cons
      toNum, // 6: Sup (Float?)
      toStr, // 7: Nom_Visa_Cad
      toDate, // 8: Date_visa
      toStr, // 9: Geometre
      toDate, // 10: Date_impl
      toStr, // 11: Num_lot
      toStr, // 12: Num_bloc
      toStr, // 13: Lieu_dit
      toStr, // 14: Largeur_Rte
      toInt, // 15: Echelle (Int?) - FIXED: was toNum
      toStr, // 16: Ccp_N
      toBool, // 17: Mise_Val
      toBool, // 18: Cloture
      toInt, // 19: Id_Lotis
      toStr, // 20: WKT_Geometry
      toStr, // 21: slug
      toStr, // 22: title
      toStr, // 23: shortDescription
      toStr, // 24: description
      toStr, // 25: category
      toStr, // 26: listingType
      toStr, // 27: listingStatus
      toDecimal, // 28: price
      toDecimal, // 29: pricePerSqM
      toStr, // 30: currency
      toBool, // 31: featured
      toBool, // 32: isForDevelopment
      toStr, // 33: createdById
    ],
    transform: (row, ctx) => {
      const id = row[0] as number | null;
      if (!isValidId(id)) {
        ctx?.addError("Missing or invalid Id_Parcel");
        return null;
      }

      const idLotis = defInt(row[19]);

      const rawCategory = row[25] as string | null;
      const category = isValidPropertyCategory(rawCategory)
        ? rawCategory
        : "LAND";

      const rawListingType = row[26] as string | null;
      const listingType = isValidListingType(rawListingType)
        ? rawListingType
        : null;

      const rawStatus = row[27] as string | null;
      const listingStatus = isValidListingStatus(rawStatus)
        ? rawStatus
        : "DRAFT";

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
        Echelle: defInt(row[15]), // FIXED: was defNum
        Ccp_N: defStr(row[16]),
        Mise_Val: defBool(row[17]),
        Cloture: defBool(row[18]),
        Id_Lotis: isValidId(idLotis) ? idLotis : null,
        WKT_Geometry: defStr(row[20]),
        slug: defStr(row[21]),
        title: defStr(row[22]),
        shortDescription: defStr(row[23]),
        description: defStr(row[24]),
        category,
        listingType,
        listingStatus,
        price: defDecimal(row[28]),
        pricePerSqM: defDecimal(row[29]),
        currency: defStr(row[30], "XAF"),
        featured: defBool(row[31], false),
        isForDevelopment: defBool(row[32], false),
        createdById: defStr(row[33]),
      };
    },
  },

  /* =========================================================
   * BATIMENT
   * Added: hasBalcony, hasTerrace, amenities fields
   * ========================================================= */
  {
    sheetName: "Batiment",
    model: "batiment",
    columnCount: 48, // INCREASED from 45
    uniqueKey: "Id_Bat",
    primaryKey: "Id_Bat",
    dependencies: ["parcelle"],
    mappers: [
      toInt, // 0: Id_Bat
      toStr, // 1: Cat_Bat
      toStr, // 2: Status
      toStr, // 3: Standing
      toBool, // 4: Cloture
      toStr, // 5: No_Permis
      toStr, // 6: Type_Lodg
      toStr, // 7: Etat_Bat
      toStr, // 8: Nom
      toStr, // 9: Mat_Bati
      toInt, // 10: Id_Parcel
      toStr, // 11: WKT_Geometry
      toStr, // 12: propertyType
      toStr, // 13: slug
      toStr, // 14: title
      toStr, // 15: shortDescription
      toStr, // 16: description
      toStr, // 17: category
      toStr, // 18: listingType
      toStr, // 19: listingStatus
      toDecimal, // 20: price
      toDecimal, // 21: rentPrice
      toDecimal, // 22: pricePerSqM
      toStr, // 23: currency
      toBool, // 24: featured
      toInt, // 25: totalFloors
      toInt, // 26: totalUnits
      toBool, // 27: hasElevator
      toNum, // 28: surfaceArea
      toStr, // 29: doorNumber
      toStr, // 30: address
      toInt, // 31: bedrooms
      toInt, // 32: bathrooms
      toInt, // 33: kitchens
      toInt, // 34: livingRooms
      toInt, // 35: floorLevel
      toBool, // 36: hasGenerator
      toBool, // 37: hasParking
      toInt, // 38: parkingSpaces
      toBool, // 39: hasPool
      toBool, // 40: hasGarden
      toBool, // 41: hasSecurity
      toBool, // 42: hasAirConditioning
      toBool, // 43: hasFurnished
      toBool, // 44: hasBalcony (NEW)
      toBool, // 45: hasTerrace (NEW)
      toStr, // 46: amenities (NEW)
      toStr, // 47: createdById
    ],
    transform: (row, ctx) => {
      const id = row[0] as number | null;
      if (!isValidId(id)) {
        ctx?.addError("Missing or invalid Id_Bat");
        return null;
      }

      const idParcel = defInt(row[10]);

      const rawPropertyType = row[12] as string | null;
      const propertyType = isValidPropertyType(rawPropertyType)
        ? rawPropertyType
        : null;

      const rawCategory = row[17] as string | null;
      const category = isValidPropertyCategory(rawCategory)
        ? rawCategory
        : "RESIDENTIAL";

      const rawListingType = row[18] as string | null;
      const listingType = isValidListingType(rawListingType)
        ? rawListingType
        : null;

      const rawStatus = row[19] as string | null;
      const listingStatus = isValidListingStatus(rawStatus)
        ? rawStatus
        : "DRAFT";

      return {
        Id_Bat: id,
        Cat_Bat: defStr(row[1]),
        Status: defStr(row[2]),
        Standing: defStr(row[3]),
        Cloture: defBool(row[4]),
        No_Permis: defStr(row[5]),
        Type_Lodg: defStr(row[6]),
        Etat_Bat: defStr(row[7]),
        Nom: defStr(row[8]),
        Mat_Bati: defStr(row[9]),
        Id_Parcel: isValidId(idParcel) ? idParcel : null,
        WKT_Geometry: defStr(row[11]),
        propertyType,
        slug: defStr(row[13]),
        title: defStr(row[14]),
        shortDescription: defStr(row[15]),
        description: defStr(row[16]),
        category,
        listingType,
        listingStatus,
        price: defDecimal(row[20]),
        rentPrice: defDecimal(row[21]),
        pricePerSqM: defDecimal(row[22]),
        currency: defStr(row[23], "XAF"),
        featured: defBool(row[24], false),
        totalFloors: defInt(row[25]),
        totalUnits: defInt(row[26]),
        hasElevator: defBool(row[27], false),
        surfaceArea: defNum(row[28]),
        doorNumber: defStr(row[29]),
        address: defStr(row[30]),
        bedrooms: defInt(row[31]),
        bathrooms: defInt(row[32]),
        kitchens: defInt(row[33]),
        livingRooms: defInt(row[34]),
        floorLevel: defInt(row[35]),
        hasGenerator: defBool(row[36], false),
        hasParking: defBool(row[37], false),
        parkingSpaces: defInt(row[38]),
        hasPool: defBool(row[39], false),
        hasGarden: defBool(row[40], false),
        hasSecurity: defBool(row[41], false),
        hasAirConditioning: defBool(row[42], false),
        hasFurnished: defBool(row[43], false),
        hasBalcony: defBool(row[44], false), // NEW
        hasTerrace: defBool(row[45], false), // NEW
        amenities: defStr(row[46]), // NEW
        createdById: defStr(row[47]),
      };
    },
  },

  /* =========================================================
   * MEDIA
   * ========================================================= */
  {
    sheetName: "Media",
    model: "media",
    columnCount: 8,
    schema: MediaSchema,
    mappers: [toInt, toStr, toStr, toStr, toInt, toStr, toBool, toInt],
    transform: (row, ctx) => {
      const entityType = row[1] as string | null;
      const url = row[2] as string | null;

      if (!entityType) {
        ctx?.addError("Missing entityType");
        return null;
      }
      if (!url || url.trim() === "") {
        ctx?.addError("Missing URL");
        return null;
      }
      if (!isValidMediaEntityType(entityType)) {
        ctx?.addError(`Invalid entityType "${entityType}"`);
        return null;
      }

      const id = row[0] as number | null;
      const entityId = row[7] as number | null;

      const result: Record<string, unknown> = {
        ...(isValidId(id) ? { id } : {}),
        entityType,
        url: url.trim(),
        type: defStr(row[3], "image"),
        order: defInt(row[4], 0),
        caption: defStr(row[5]),
        isPrimary: defBool(row[6], false),
      };

      if (isValidId(entityId)) {
        switch (entityType) {
          case "LOTISSEMENT":
            result.lotissementId = entityId;
            break;
          case "PARCELLE":
            result.parcelleId = entityId;
            break;
          case "BATIMENT":
            result.batimentId = entityId;
            break;
          case "INFRASTRUCTURE":
            result.infrastructureId = entityId;
            break;
        }
      } else {
        ctx?.addWarning(
          `Media row missing valid entityId for type ${entityType}`,
        );
      }

      return result;
    },
  },

  /* =========================================================
   * JUNCTION TABLES - With Composite Keys
   * ========================================================= */
  {
    sheetName: "Payer",
    model: "payer",
    columnCount: 4,
    compositeKey: { fields: ["Id_Parcel", "Id_Bat", "Id_Taxe"] },
    dependencies: ["parcelle", "batiment", "taxe_immobiliere"],
    mappers: [toInt, toInt, toInt, toInt],
    transform: (row, ctx) => {
      const idParcel = row[0] as number | null;
      const idBat = row[1] as number | null;
      const idTaxe = row[2] as number | null;

      if (!isValidId(idParcel)) {
        ctx?.addError("Missing required FK: Id_Parcel");
        return null;
      }
      if (!isValidId(idBat)) {
        ctx?.addError("Missing required FK: Id_Bat");
        return null;
      }
      if (!isValidId(idTaxe)) {
        ctx?.addError("Missing required FK: Id_Taxe");
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
    compositeKey: { fields: ["Id_Lotis", "Id_Riv"] },
    dependencies: ["lotissement", "riviere"],
    mappers: [toInt, toInt],
    transform: (row, ctx) => {
      const idLotis = row[0] as number | null;
      const idRiv = row[1] as number | null;

      if (!isValidId(idLotis)) {
        ctx?.addError("Missing required FK: Id_Lotis");
        return null;
      }
      if (!isValidId(idRiv)) {
        ctx?.addError("Missing required FK: Id_Riv");
        return null;
      }

      return { Id_Lotis: idLotis, Id_Riv: idRiv };
    },
  },

  {
    sheetName: "Alimenter",
    model: "alimenter",
    columnCount: 2,
    compositeKey: { fields: ["Id_Bat", "Id_Reseaux"] },
    dependencies: ["batiment", "reseau_energetique"],
    mappers: [toInt, toInt],
    transform: (row, ctx) => {
      const idBat = row[0] as number | null;
      const idReseaux = row[1] as number | null;

      if (!isValidId(idBat)) {
        ctx?.addError("Missing required FK: Id_Bat");
        return null;
      }
      if (!isValidId(idReseaux)) {
        ctx?.addError("Missing required FK: Id_Reseaux");
        return null;
      }

      return { Id_Bat: idBat, Id_Reseaux: idReseaux };
    },
  },

  {
    sheetName: "Contenir",
    model: "contenir",
    columnCount: 2,
    compositeKey: { fields: ["Id_Parcel", "Id_Borne"] },
    dependencies: ["parcelle", "borne"],
    mappers: [toInt, toInt],
    transform: (row, ctx) => {
      const idParcel = row[0] as number | null;
      const idBorne = row[1] as number | null;

      if (!isValidId(idParcel)) {
        ctx?.addError("Missing required FK: Id_Parcel");
        return null;
      }
      if (!isValidId(idBorne)) {
        ctx?.addError("Missing required FK: Id_Borne");
        return null;
      }

      return { Id_Parcel: idParcel, Id_Borne: idBorne };
    },
  },

  {
    sheetName: "Trouver",
    model: "trouver",
    columnCount: 2,
    compositeKey: { fields: ["Id_Parcel", "Id_Infras"] },
    dependencies: ["parcelle", "infrastructure"],
    mappers: [toInt, toInt],
    transform: (row, ctx) => {
      const idParcel = row[0] as number | null;
      const idInfras = row[1] as number | null;

      if (!isValidId(idParcel)) {
        ctx?.addError("Missing required FK: Id_Parcel");
        return null;
      }
      if (!isValidId(idInfras)) {
        ctx?.addError("Missing required FK: Id_Infras");
        return null;
      }

      return { Id_Parcel: idParcel, Id_Infras: idInfras };
    },
  },

  {
    sheetName: "Eclairer",
    model: "eclairer",
    columnCount: 2,
    compositeKey: { fields: ["Id_Parcel", "Id_Equip"] },
    dependencies: ["parcelle", "equipement"],
    mappers: [toInt, toInt],
    transform: (row, ctx) => {
      const idParcel = row[0] as number | null;
      const idEquip = row[1] as number | null;

      if (!isValidId(idParcel)) {
        ctx?.addError("Missing required FK: Id_Parcel");
        return null;
      }
      if (!isValidId(idEquip)) {
        ctx?.addError("Missing required FK: Id_Equip");
        return null;
      }

      return { Id_Parcel: idParcel, Id_Equip: idEquip };
    },
  },

  {
    sheetName: "Desservir",
    model: "desservir",
    columnCount: 2,
    compositeKey: { fields: ["Id_Parcel", "Id_Rte"] },
    dependencies: ["parcelle", "route"],
    mappers: [toInt, toInt],
    transform: (row, ctx) => {
      const idParcel = row[0] as number | null;
      const idRte = row[1] as number | null;

      if (!isValidId(idParcel)) {
        ctx?.addError("Missing required FK: Id_Parcel");
        return null;
      }
      if (!isValidId(idRte)) {
        ctx?.addError("Missing required FK: Id_Rte");
        return null;
      }

      return { Id_Parcel: idParcel, Id_Rte: idRte };
    },
  },

  {
    sheetName: "Approvisionner",
    model: "approvisionner",
    columnCount: 2,
    compositeKey: { fields: ["Id_Bat", "Id_Reseaux"] },
    dependencies: ["batiment", "reseau_en_eau"],
    mappers: [toInt, toInt],
    transform: (row, ctx) => {
      const idBat = row[0] as number | null;
      const idReseaux = row[1] as number | null;

      if (!isValidId(idBat)) {
        ctx?.addError("Missing required FK: Id_Bat");
        return null;
      }
      if (!isValidId(idReseaux)) {
        ctx?.addError("Missing required FK: Id_Reseaux");
        return null;
      }

      return { Id_Bat: idBat, Id_Reseaux: idReseaux };
    },
  },
];

/* =========================================================
 * HELPERS
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

export const getConfigByModel = (
  model: PrismaModelName,
): SheetConfig | undefined => {
  return excelImportConfig.find((config) => config.model === model);
};

export const getForeignKeyConfig = (
  model: PrismaModelName,
): ForeignKeyConfig[] => {
  return FOREIGN_KEY_MAP[model] || [];
};

/**
 * Returns sheets in correct import order based on dependencies
 */
export function getImportOrder(): string[] {
  const visited = new Set<string>();
  const order: string[] = [];

  function visit(sheetName: string) {
    if (visited.has(sheetName)) return;

    const config = getSheetConfig(sheetName);
    if (!config) return;

    if (config.dependencies) {
      for (const dep of config.dependencies) {
        const depConfig = excelImportConfig.find((c) => c.model === dep);
        if (depConfig) {
          visit(depConfig.sheetName);
        }
      }
    }

    visited.add(sheetName);
    order.push(sheetName);
  }

  for (const config of excelImportConfig) {
    visit(config.sheetName);
  }

  return order;
}

/**
 * Returns the primary key field for a model
 */
export function getPrimaryKeyField(model: PrismaModelName): string | undefined {
  const config = getConfigByModel(model);
  return config?.primaryKey || config?.uniqueKey;
}

/**
 * Check if model has composite key
 */
export function hasCompositeKey(model: PrismaModelName): boolean {
  const config = getConfigByModel(model);
  return !!config?.compositeKey;
}

/**
 * Get composite key config
 */
export function getCompositeKey(
  model: PrismaModelName,
): CompositeKey | undefined {
  const config = getConfigByModel(model);
  return config?.compositeKey;
}

/* =========================================================
 * PROPERTY TYPE HELPERS
 * ========================================================= */

export const PROPERTY_TYPE_CONFIG = {
  APARTMENT: { label: "Appartement", icon: "🏢", category: "RESIDENTIAL" },
  HOUSE: { label: "Maison", icon: "🏠", category: "RESIDENTIAL" },
  VILLA: { label: "Villa", icon: "🏡", category: "RESIDENTIAL" },
  STUDIO: { label: "Studio", icon: "🛏️", category: "RESIDENTIAL" },
  DUPLEX: { label: "Duplex", icon: "🏘️", category: "RESIDENTIAL" },
  TRIPLEX: { label: "Triplex", icon: "🏘️", category: "RESIDENTIAL" },
  PENTHOUSE: { label: "Penthouse", icon: "✨", category: "RESIDENTIAL" },
  CHAMBRE_MODERNE: {
    label: "Chambre Moderne",
    icon: "🚪",
    category: "RESIDENTIAL",
  },
  CHAMBRE: { label: "Chambre", icon: "🛏️", category: "RESIDENTIAL" },
  OFFICE: { label: "Bureau", icon: "💼", category: "COMMERCIAL" },
  SHOP: { label: "Boutique", icon: "🏪", category: "COMMERCIAL" },
  RESTAURANT: { label: "Restaurant", icon: "🍽️", category: "COMMERCIAL" },
  HOTEL: { label: "Hôtel", icon: "🏨", category: "COMMERCIAL" },
  WAREHOUSE: { label: "Entrepôt", icon: "🏭", category: "COMMERCIAL" },
  COMMERCIAL_SPACE: {
    label: "Local Commercial",
    icon: "🏬",
    category: "COMMERCIAL",
  },
  INDUSTRIAL: { label: "Industriel", icon: "🏭", category: "INDUSTRIAL" },
  FACTORY: { label: "Usine", icon: "🏭", category: "INDUSTRIAL" },
  BUILDING: { label: "Immeuble", icon: "🏗️", category: "BUILDING" },
  MIXED_USE: { label: "Usage Mixte", icon: "🏢", category: "MIXED" },
} as const;

export const getPropertyTypeLabel = (type: PropertyTypeValue): string => {
  return PROPERTY_TYPE_CONFIG[type]?.label || type;
};

export const getPropertyTypeIcon = (type: PropertyTypeValue): string => {
  return PROPERTY_TYPE_CONFIG[type]?.icon || "🏠";
};
