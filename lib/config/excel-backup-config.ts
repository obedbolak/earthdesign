import type { PrismaModelName } from "@/lib/config/excel-import-config";

/**
 * Column order for a workbook that can be uploaded through the Excel importer.
 * Do not include audit fields here: the importer deliberately assigns the
 * importing user and lets the database maintain timestamps.
 */
export const backupColumns: Record<PrismaModelName, string[]> = {
  route: ["Id_Rte", "Cat_Rte", "Type_Rte", "Largeur_Rte", "Etat_Rte", "Mat_Rte", "WKT_Geometry"],
  riviere: ["Id_Riv", "Nom_Riv", "Type_Riv", "Etat_amenag", "Debit_Riv", "WKT_Geometry"],
  equipement: ["Id_Equip", "Type_Equip", "Design_Equip", "Etat_Equip", "Mat_Equip", "WKT_Geometry"],
  infrastructure: ["Id_Infras", "Nom_infras", "Type_Infraas", "Categorie_infras", "Cycle", "Statut_infras", "Standing", "WKT_Geometry"],
  borne: ["Id_Borne", "coord_x", "coord_y", "coord_z", "WKT_Geometry"],
  taxe_immobiliere: ["Id_Taxe", "Num_TF", "Nom_Proprio", "NIU", "Val_imm", "Taxe_Payee", "Date_declaree", "Type_taxe"],
  reseau_energetique: ["Id_Reseaux", "Source_Res", "Type_Reseau", "Etat_Res", "Materiau", "WKT_Geometry"],
  reseau_en_eau: ["Id_Reseaux", "Source_Res", "Type_Res", "Etat_Res", "Mat_Res", "WKT_Geometry"],
  region: ["Id_Reg", "Nom_Reg", "Sup_Reg", "Chef_lieu_Reg", "WKT_Geometry"],
  departement: ["Id_Dept", "Nom_Dept", "Sup_Dept", "Chef_lieu_Dept", "Id_Reg", "WKT_Geometry"],
  arrondissement: ["Id_Arrond", "Nom_Arrond", "Sup_Arrond", "Chef_lieu_Arrond", "Commune", "Id_Dept", "WKT_Geometry"],
  lotissement: ["Id_Lotis", "Nom_proprio", "Num_TF", "Statut", "Nom_cons", "Surface", "Nom_visa_lotis", "Date_approb", "Geo_exe", "Nbre_lots", "Lieudit", "Echelle", "Ccp", "Id_Arrond", "WKT_Geometry", "slug", "title", "shortDescription", "description", "category", "listingType", "listingStatus", "price", "pricePerSqM", "currency", "featured", "totalParcels", "availableParcels", "hasRoadAccess", "hasElectricity", "hasWater", "mapLatitude", "mapLongitude", "locationSource"],
  parcelle: ["Id_Parcel", "Nom_Prop", "TF_Mere", "Mode_Obtent", "TF_Cree", "Nom_Cons", "Sup", "Nom_Visa_Cad", "Date_visa", "Geometre", "Date_impl", "Num_lot", "Num_bloc", "Lieu_dit", "Largeur_Rte", "Echelle", "Ccp_N", "Mise_Val", "Cloture", "Id_Lotis", "WKT_Geometry", "slug", "title", "shortDescription", "description", "category", "listingType", "listingStatus", "price", "pricePerSqM", "currency", "featured", "isForDevelopment", "mapLatitude", "mapLongitude", "locationSource"],
  batiment: ["Id_Bat", "Cat_Bat", "Status", "Standing", "Cloture", "No_Permis", "Type_Lodg", "Etat_Bat", "Nom", "Mat_Bati", "Id_Parcel", "WKT_Geometry", "propertyType", "slug", "title", "shortDescription", "description", "category", "listingType", "listingStatus", "price", "rentPrice", "pricePerSqM", "currency", "featured", "totalFloors", "totalUnits", "hasElevator", "surfaceArea", "doorNumber", "address", "bedrooms", "bathrooms", "kitchens", "livingRooms", "floorLevel", "hasGenerator", "hasParking", "parkingSpaces", "hasPool", "hasGarden", "hasSecurity", "hasAirConditioning", "hasFurnished", "hasBalcony", "hasTerrace", "amenities", "dailyRentPrice", "weeklyRentPrice", "mapLatitude", "mapLongitude", "locationSource"],
  media: ["id", "entityType", "url", "type", "order", "caption", "isPrimary", "entityId"],
  payer: ["Id_Parcel", "Id_Bat", "Id_Taxe", "date_paye"],
  limitrophe: ["Id_Lotis", "Id_Riv"],
  alimenter: ["Id_Bat", "Id_Reseaux"],
  contenir: ["Id_Parcel", "Id_Borne"],
  trouver: ["Id_Parcel", "Id_Infras"],
  eclairer: ["Id_Parcel", "Id_Equip"],
  desservir: ["Id_Parcel", "Id_Rte"],
  approvisionner: ["Id_Bat", "Id_Reseaux"],
};

export function getBackupValue(
  model: PrismaModelName,
  field: string,
  row: Record<string, unknown>,
): unknown {
  if (model === "media" && field === "entityId") {
    switch (row.entityType) {
      case "LOTISSEMENT":
        return row.lotissementId ?? null;
      case "PARCELLE":
        return row.parcelleId ?? null;
      case "BATIMENT":
        return row.batimentId ?? null;
      case "INFRASTRUCTURE":
        return row.infrastructureId ?? null;
      default:
        return null;
    }
  }

  const value = row[field];
  if (value instanceof Date) return value;
  if (value && typeof value === "object" && "toString" in value) {
    return String(value);
  }
  return value ?? null;
}
