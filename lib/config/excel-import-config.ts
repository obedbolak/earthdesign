// lib/config/excel-import-config.ts
import { toStr, toNum, toBool, toDate } from '@/lib/utils/excel-import';
import { PropertyType } from '@prisma/client';

type ColumnMapper = (cellValue: any) => any;

export interface SheetConfig<T> {
  sheetName: string;
  model: keyof typeof import('@/lib/prisma').default;
  columnCount: number;
  mappers: ColumnMapper[];
  transform: (mappedValues: unknown[]) => T | null;
}

/* ---------- helpers for nullable columns ---------- */
const defNum = (v: any, d: number | null = null): number | null => {
  if (v === undefined || v === '' || v === null) return d;
  const n = Number(v);
  return isNaN(n) ? d : n;
};
const defBool = (v: any, d = false): boolean => {
  if (v === undefined || v === '' || v === null) return d;
  return toBool(v) as boolean;
};
const defStr = (v: any, d: string | null = null): string | null => {
  if (v === undefined || v === '' || v === null) return d;
  return toStr(v);
};

export const excelImportConfig: SheetConfig<any>[] = [
  /* =========================================================
   * INDEPENDENT TABLES (no FK) - Import FIRST
   * ========================================================= */
  {
    sheetName: 'Route',
    model: 'route',
    columnCount: 7,
    mappers: [toNum, toStr, toStr, toStr, toStr, toStr, toStr],
    transform: (row) => {
      const id = row[0];
      if (!id || id === 0) return null;
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
    sheetName: 'Riviere',
    model: 'riviere',
    columnCount: 6,
    mappers: [toNum, toStr, toStr, toStr, toStr, toStr],
    transform: (row) => {
      const id = row[0];
      if (!id || id === 0) return null;
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
    sheetName: 'Equipement',
    model: 'equipement',
    columnCount: 6,
    mappers: [toNum, toStr, toStr, toStr, toStr, toStr],
    transform: (row) => {
      const id = row[0];
      if (!id || id === 0) return null;
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
    sheetName: 'Infrastructure',
    model: 'infrastructure',
    columnCount: 15,
    mappers: [toNum, toStr, toStr, toStr, toStr, toStr, toStr, toStr, toStr, toStr, toStr, toStr, toStr, toStr, toStr],
    transform: (row) => {
      const id = row[0];
      if (!id || id === 0) return null;
      return {
        Id_Infras: id,
        Nom_infras: defStr(row[1]),
        Type_Infraas: defStr(row[2]),
        Categorie_infras: defStr(row[3]),
        Cycle: defStr(row[4]),
        Statut_infras: defStr(row[5]),
        Standing: defStr(row[6]),
        Video_URL: defStr(row[7]),
        Image_URL_1: defStr(row[8]),
        Image_URL_2: defStr(row[9]),
        Image_URL_3: defStr(row[10]),
        Image_URL_4: defStr(row[11]),
        Image_URL_5: defStr(row[12]),
        Image_URL_6: defStr(row[13]),
        WKT_Geometry: defStr(row[14]),
      };
    },
  },
  {
    sheetName: 'Borne',
    model: 'borne',
    columnCount: 5,
    mappers: [toNum, toNum, toNum, toNum, toStr],
    transform: (row) => {
      const id = row[0];
      if (!id || id === 0) return null;
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
    sheetName: 'Taxe_immobiliere',
    model: 'taxe_immobiliere',
    columnCount: 8,
    mappers: [toNum, toStr, toStr, toStr, toNum, toBool, toDate, toStr],
    transform: (row) => {
      const id = row[0];
      if (!id || id === 0) return null;
      return {
        Id_Taxe: id,
        Num_TF: defStr(row[1]),
        Nom_Proprio: defStr(row[2]),
        NIU: defStr(row[3]),
        Val_imm: defNum(row[4]),
        Taxe_Payee: defBool(row[5]),
        Date_declaree: row[6] || null,
        Type_taxe: defStr(row[7]),
      };
    },
  },
  {
    sheetName: 'Reseau_energetique',
    model: 'reseau_energetique',
    columnCount: 6,
    mappers: [toNum, toNum, toStr, toStr, toStr, toStr],
    transform: (row) => {
      const id = row[0];
      if (!id || id === 0) return null;
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
    sheetName: 'Reseau_en_eau',
    model: 'reseau_en_eau',
    columnCount: 6,
    mappers: [toNum, toNum, toStr, toStr, toStr, toStr],
    transform: (row) => {
      const id = row[0];
      if (!id || id === 0) return null;
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
   * HIERARCHICAL GEO (order matters)
   * ========================================================= */
  {
    sheetName: 'Region',
    model: 'region',
    columnCount: 5,
    mappers: [toNum, toStr, toNum, toStr, toStr],
    transform: (row) => {
      const id = row[0];
      if (!id || id === 0) return null;
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
    sheetName: 'Departement',
    model: 'departement',
    columnCount: 6,
    mappers: [toNum, toStr, toNum, toStr, toNum, toStr],
    transform: (row) => {
      const id = row[0];
      if (!id || id === 0) return null;
      return {
        Id_Dept: id,
        Nom_Dept: defStr(row[1]),
        Sup_Dept: defNum(row[2]),
        Chef_lieu_Dept: defStr(row[3]),
        Id_Reg: defNum(row[4]),
        WKT_Geometry: defStr(row[5]),
      };
    },
  },
  {
    sheetName: 'Arrondissement',
    model: 'arrondissement',
    columnCount: 7,
    mappers: [toNum, toStr, toNum, toStr, toStr, toNum, toStr],
    transform: (row) => {
      const id = row[0];
      if (!id || id === 0) return null;
      return {
        Id_Arrond: id,
        Nom_Arrond: defStr(row[1]),
        Sup_Arrond: defNum(row[2]),
        Chef_lieu_Arrond: defStr(row[3]),
        Commune: defStr(row[4]),
        Id_Dept: defNum(row[5]),
        WKT_Geometry: defStr(row[6]),
      };
    },
  },

  /* =========================================
   * LOTISSEMENT (32 columns)
   * ========================================= */
  {
    sheetName: 'Lotissement',
    model: 'lotissement',
    columnCount: 32,
    mappers: [
      toNum, toStr, toStr, toStr, toStr, toNum, toStr, toDate, toStr, toNum,
      toStr, toNum, toStr, toStr, toStr, toStr, toStr, toStr, toStr, toStr,
      toNum, toStr, toNum, toNum, toStr, toBool, toBool, toNum, toStr, toStr,
      toBool, toBool
    ],
    transform: (row) => {
      const id = row[0];
      if (!id || id === 0) return null;
      return {
        Id_Lotis: id,
        Nom_proprio: defStr(row[1]),
        Num_TF: defStr(row[2]),
        Statut: defStr(row[3]),
        Nom_cons: defStr(row[4]),
        Surface: defNum(row[5]),
        Nom_visa_lotis: defStr(row[6]),
        Date_approb: row[7] || null,
        Geo_exe: defStr(row[8]),
        Nbre_lots: defNum(row[9]),
        Lieudit: defStr(row[10]),
        Echelle: defNum(row[11]),
        Ccp: defStr(row[12]),
        Video_URL: defStr(row[13]),
        Image_URL_1: defStr(row[14]),
        Image_URL_2: defStr(row[15]),
        Image_URL_3: defStr(row[16]),
        Image_URL_4: defStr(row[17]),
        Image_URL_5: defStr(row[18]),
        Image_URL_6: defStr(row[19]),
        Id_Arrond: defNum(row[20]),
        WKT_Geometry: defStr(row[21]),
        price: defNum(row[22]),
        pricePerSqM: defNum(row[23]),
        currency: defStr(row[24], 'XAF'),
        forSale: defBool(row[25], false),
        forRent: defBool(row[26], false),
        rentPrice: defNum(row[27]),
        shortDescription: defStr(row[28]),
        description: defStr(row[29]),
        published: defBool(row[30], false),
        featured: defBool(row[31], false),
      };
    },
  },

  /* =========================================
   * PARCELLE (38 columns)
   * ========================================= */
  {
    sheetName: 'Parcelle',
    model: 'parcelle',
    columnCount: 38,
    mappers: [
      toNum, toStr, toStr, toStr, toStr, toStr, toNum, toStr, toDate, toStr,
      toDate, toStr, toStr, toStr, toStr, toNum, toStr, toBool, toBool, toStr,
      toStr, toStr, toStr, toStr, toStr, toStr, toNum, toStr, toNum, toNum,
      toStr, toBool, toBool, toNum, toStr, toStr, toBool, toBool
    ],
    transform: (row) => {
      const id = row[0];
      if (!id || id === 0) return null;
      return {
        Id_Parcel: id,
        Nom_Prop: defStr(row[1]),
        TF_Mere: defStr(row[2]),
        Mode_Obtent: defStr(row[3]),
        TF_Cree: defStr(row[4]),
        Nom_Cons: defStr(row[5]),
        Sup: defNum(row[6]),
        Nom_Visa_Cad: defStr(row[7]),
        Date_visa: row[8] || null,
        Geometre: defStr(row[9]),
        Date_impl: row[10] || null,
        Num_lot: defStr(row[11]),
        Num_bloc: defStr(row[12]),
        Lieu_dit: defStr(row[13]),
        Largeur_Rte: defStr(row[14]),
        Echelle: defNum(row[15]),
        Ccp_N: defStr(row[16]),
        Mise_Val: defBool(row[17]),
        Cloture: defBool(row[18]),
        Video_URL: defStr(row[19]),
        Image_URL_1: defStr(row[20]),
        Image_URL_2: defStr(row[21]),
        Image_URL_3: defStr(row[22]),
        Image_URL_4: defStr(row[23]),
        Image_URL_5: defStr(row[24]),
        Image_URL_6: defStr(row[25]),
        Id_Lotis: defNum(row[26]),
        WKT_Geometry: defStr(row[27]),
        price: defNum(row[28]),
        pricePerSqM: defNum(row[29]),
        currency: defStr(row[30], 'XAF'),
        forSale: defBool(row[31], false),
        forRent: defBool(row[32], false),
        rentPrice: defNum(row[33]),
        shortDescription: defStr(row[34]),
        description: defStr(row[35]),
        published: defBool(row[36], false),
        featured: defBool(row[37], false),
      };
    },
  },

  /* =========================================
   * BATIMENT (30 columns)
   * ========================================= */
  {
    sheetName: 'Batiment',
    model: 'batiment',
    columnCount: 30,
    mappers: [
      toNum, toStr, toStr, toStr, toStr, toBool, toStr, toStr, toStr, toStr,
      toStr, toStr, toStr, toStr, toStr, toStr, toStr, toStr, toNum, toStr,
      toNum, toNum, toNum, toNum, toNum, toNum, toBool, toBool, toBool, toNum
    ],
    transform: (row) => {
      const id = row[0];
      if (!id || id === 0) return null;
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
        Video_URL: defStr(row[11]),
        Image_URL_1: defStr(row[12]),
        Image_URL_2: defStr(row[13]),
        Image_URL_3: defStr(row[14]),
        Image_URL_4: defStr(row[15]),
        Image_URL_5: defStr(row[16]),
        Image_URL_6: defStr(row[17]),
        Id_Parcel: defNum(row[18]),
        WKT_Geometry: defStr(row[19]),
        bedrooms: defNum(row[20], 0),
        bathrooms: defNum(row[21], 0),
        kitchens: defNum(row[22], 1),
        livingRooms: defNum(row[23], 1),
        totalFloors: defNum(row[24], 0),
        totalUnits: defNum(row[25], 0),
        hasElevator: defBool(row[26], false),
        hasGenerator: defBool(row[27], false),
        hasParking: defBool(row[28], false),
        parkingSpaces: defNum(row[29], 0),
      };
    },
  },

  /* =========================================================
   * PROPERTY (30 columns)
   * ========================================================= */
  {
  sheetName: 'Property',
  model: 'property',
  columnCount: 30,
  mappers: [
    toNum, toStr, toStr, toNum, toStr, toStr, toBool, toBool, toNum, toBool,
    toBool, toNum, toNum, toNum, toNum, toBool, toBool, toNum, toNum, toNum,
    toNum, toStr, toStr, toStr, toStr, toStr, toStr, toStr, toBool, toBool
  ],
  transform: (mappedValues: unknown[]) => {
    const row = mappedValues as any[];

    const parcelleId = row[19];
    if (!parcelleId || parcelleId === 0) {
      console.warn('Skipping Property row: missing or invalid parcelleId');
      return null;
    }

    const rawType = row[5] as PropertyType | null;
    const validTypes: PropertyType[] = ['Apartment', 'House', 'Villa', 'Office', 'Commercial', 'Land', 'Building', 'Studio', 'Duplex'];
    if (rawType && !validTypes.includes(rawType)) {
      console.warn(`Invalid Property type "${rawType}" – skipping row`);
      return null;
    }

    // FIX: Only include batimentId if it's a valid positive number
    const batimentId = row[20];
    const validBatimentId = batimentId && batimentId > 0 ? batimentId : null;

    return {
      id: row[0] > 0 ? row[0] : undefined,
      title: row[1] || 'Untitled Property',
      description: defStr(row[2]),
      price: row[3],
      currency: defStr(row[4], 'XAF'),
      type: rawType || 'House',
      forSale: defBool(row[6], true),
      forRent: defBool(row[7], false),
      rentPrice: defNum(row[8]),
      isLandForDevelopment: defBool(row[9], false),
      approvedForApartments: defBool(row[10]),
      bedrooms: defNum(row[11]),
      bathrooms: defNum(row[12]),
      kitchens: defNum(row[13]),
      livingRooms: defNum(row[14]),
      hasGenerator: defBool(row[15], false),
      hasParking: defBool(row[16], false),
      floorLevel: defNum(row[17]),
      totalFloors: defNum(row[18]),
      parcelleId,
      batimentId: validBatimentId,  // FIX: null instead of 0
      imageUrl1: defStr(row[21]),
      imageUrl2: defStr(row[22]),
      imageUrl3: defStr(row[23]),
      imageUrl4: defStr(row[24]),
      imageUrl5: defStr(row[25]),
      imageUrl6: defStr(row[26]),
      videoUrl: defStr(row[27]),
      published: defBool(row[28], false),
      featured: defBool(row[29], false),
    };
  },
},
  /* =========================================================
   * RELATIONSHIP TABLES
   * ========================================================= */
  {
    sheetName: 'Payer',
    model: 'payer',
    columnCount: 4,
    mappers: [toNum, toNum, toNum, toNum],
    transform: (row) => {
      if (!row[0] || !row[1] || !row[2]) return null;
      return {
        Id_Parcel: row[0],
        Id_Bat: row[1],
        Id_Taxe: row[2],
        date_paye: defNum(row[3]),
      };
    },
  },
  {
    sheetName: 'Limitrophe',
    model: 'limitrophe',
    columnCount: 2,
    mappers: [toNum, toNum],
    transform: (row) => (row[0] && row[1] ? { Id_Lotis: row[0], Id_Riv: row[1] } : null),
  },
  {
    sheetName: 'Alimenter',
    model: 'alimenter',
    columnCount: 2,
    mappers: [toNum, toNum],
    transform: (row) => (row[0] && row[1] ? { Id_Bat: row[0], Id_Reseaux: row[1] } : null),
  },
  {
    sheetName: 'Contenir',
    model: 'contenir',
    columnCount: 2,
    mappers: [toNum, toNum],
    transform: (row) => (row[0] && row[1] ? { Id_Parcel: row[0], Id_Borne: row[1] } : null),
  },
  {
    sheetName: 'Trouver',
    model: 'trouver',
    columnCount: 2,
    mappers: [toNum, toNum],
    transform: (row) => (row[0] && row[1] ? { Id_Parcel: row[0], Id_Infras: row[1] } : null),
  },
  {
    sheetName: 'Eclairer',
    model: 'eclairer',
    columnCount: 2,
    mappers: [toNum, toNum],
    transform: (row) => (row[0] && row[1] ? { Id_Parcel: row[0], Id_Equip: row[1] } : null),
  },
  {
    sheetName: 'Desservir',
    model: 'desservir',
    columnCount: 2,
    mappers: [toNum, toNum],
    transform: (row) => (row[0] && row[1] ? { Id_Parcel: row[0], Id_Rte: row[1] } : null),
  },
  {
    sheetName: 'Approvisionner',
    model: 'approvisionner',
    columnCount: 2,
    mappers: [toNum, toNum],
    transform: (row) => (row[0] && row[1] ? { Id_Bat: row[0], Id_Reseaux: row[1] } : null),
  },
];