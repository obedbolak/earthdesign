// app/api/upload-excel/types.ts

// Helper types
type Nullable<T> = T | null;

// Row data interfaces (based on your Excel columns)
export interface RouteData {
  Cat_Rte: Nullable<string>;
  Type_Rte: Nullable<string>;
  Largeur_Rte: Nullable<string>;
  Etat_Rte: Nullable<string>;
  Mat_Rte: Nullable<string>;
  WKT_Geometry: Nullable<string>;
}

export interface RiviereData {
  Nom_Riv: Nullable<string>;
  Type_Riv: Nullable<string>;
  Etat_amenag: Nullable<string>;
  Debit_Riv: Nullable<string>;
  WKT_Geometry: Nullable<string>;
}

export interface EquipementData {
  Type_Equip: Nullable<string>;
  Design_Equip: Nullable<string>;
  Etat_Equip: Nullable<string>;
  Mat_Equip: Nullable<string>;
  WKT_Geometry: Nullable<string>;
}

export interface InfrastructureData {
  Nom_infras: Nullable<string>;
  Type_Infraas: Nullable<string>;
  Categorie_infras: Nullable<string>;
  Cycle: Nullable<string>;
  Statut_infras: Nullable<string>;
  Standing: Nullable<string>;
  Video_URL: Nullable<string>;
  Image_URL_1: Nullable<string>;
  Image_URL_2: Nullable<string>;
  Image_URL_3: Nullable<string>;
  Image_URL_4: Nullable<string>;
  Image_URL_5: Nullable<string>;
  Image_URL_6: Nullable<string>;
  WKT_Geometry: Nullable<string>;
}

export interface BorneData {
  coord_x: Nullable<number>;
  coord_y: Nullable<number>;
  coord_z: Nullable<number>;
  WKT_Geometry: Nullable<string>;
}

export interface TaxeImmobiliereData {
  Num_TF: Nullable<string>;
  Nom_Proprio: Nullable<string>;
  NIU: Nullable<string>;
  Val_imm: Nullable<number>;
  Taxe_Payee: Nullable<boolean>;
  Date_declaree: Nullable<Date>;
  Type_taxe: Nullable<string>;
}

export interface ReseauEnergetiqueData {
  Source_Res: Nullable<number>;
  Type_Reseau: Nullable<string>;
  Etat_Res: Nullable<string>;
  Materiau: Nullable<string>;
  WKT_Geometry: Nullable<string>;
}

export interface ReseauEnEauData {
  Source_Res: Nullable<number>;
  Type_Res: Nullable<string>;
  Etat_Res: Nullable<string>;
  Mat_Res: Nullable<string>;
  WKT_Geometry: Nullable<string>;
}

export interface RegionData {
  Nom_Reg: Nullable<string>;
  Sup_Reg: Nullable<number>;
  Chef_lieu_Reg: Nullable<string>;
  WKT_Geometry: Nullable<string>;
}

export interface DepartementData {
  Nom_Dept: Nullable<string>;
  Sup_Dept: Nullable<number>;
  Chef_lieu_Dept: Nullable<string>;
  Id_Reg: Nullable<number>;
  WKT_Geometry: Nullable<string>;
}

export interface ArrondissementData {
  Nom_Arrond: Nullable<string>;
  Sup_Arrond: Nullable<number>;
  Chef_lieu_Arrond: Nullable<string>;
  Commune: Nullable<string>;
  Id_Dept: Nullable<number>;
  WKT_Geometry: Nullable<string>;
}

export interface LotissementData {
  Nom_proprio: Nullable<string>;
  Num_TF: Nullable<string>;
  Statut: Nullable<string>;
  Nom_cons: Nullable<string>;
  Surface: Nullable<number>;
  Nom_visa_lotis: Nullable<string>;
  Date_approb: Nullable<Date>;
  Geo_exe: Nullable<string>;
  Nbre_lots: Nullable<number>;
  Lieudit: Nullable<string>;
  Echelle: Nullable<number>;
  Ccp: Nullable<string>;
  Video_URL: Nullable<string>;
  Image_URL_1: Nullable<string>;
  Image_URL_2: Nullable<string>;
  Image_URL_3: Nullable<string>;
  Image_URL_4: Nullable<string>;
  Image_URL_5: Nullable<string>;
  Image_URL_6: Nullable<string>;
  Id_Arrond: Nullable<number>;
  WKT_Geometry: Nullable<string>;
}

export interface ParcelleData {
  Nom_Prop: Nullable<string>;
  TF_Mere: Nullable<string>;
  Mode_Obtent: Nullable<string>;
  TF_Cree: Nullable<string>;
  Nom_Cons: Nullable<string>;
  Sup: Nullable<number>;
  Nom_Visa_Cad: Nullable<string>;
  Date_visa: Nullable<Date>;
  Geometre: Nullable<string>;
  Date_impl: Nullable<Date>;
  Num_lot: Nullable<string>;
  Num_bloc: Nullable<string>;
  Lieu_dit: Nullable<string>;
  Largeur_Rte: Nullable<string>;
  Echelle: Nullable<number>;
  Ccp_N: Nullable<string>;
  Mise_Val: Nullable<boolean>;
  Cloture: Nullable<boolean>;
  Video_URL: Nullable<string>;
  Image_URL_1: Nullable<string>;
  Image_URL_2: Nullable<string>;
  Image_URL_3: Nullable<string>;
  Image_URL_4: Nullable<string>;
  Image_URL_5: Nullable<string>;
  Image_URL_6: Nullable<string>;
  Id_Lotis: Nullable<number>;
  WKT_Geometry: Nullable<string>;
}

export interface BatimentData {
  Type_Usage: Nullable<string>;
  Cat_Bat: Nullable<string>;
  Status: Nullable<string>;
  Standing: Nullable<string>;
  Cloture: Nullable<boolean>;
  No_Permis: Nullable<string>;
  Type_Lodg: Nullable<string>;
  Etat_Bat: Nullable<string>;
  Nom: Nullable<string>;
  Mat_Bati: Nullable<string>;
  Video_URL: Nullable<string>;
  Image_URL_1: Nullable<string>;
  Image_URL_2: Nullable<string>;
  Image_URL_3: Nullable<string>;
  Image_URL_4: Nullable<string>;
  Image_URL_5: Nullable<string>;
  Image_URL_6: Nullable<string>;
  Id_Parcel: Nullable<number>;
  WKT_Geometry: Nullable<string>;
}

export interface PayerData {
  Id_Parcel: Nullable<number>;
  Id_Bat: Nullable<number>;
  Id_Taxe: Nullable<number>;
  date_paye: Nullable<number>;
}

export interface LimitropheData {
  Id_Lotis: Nullable<number>;
  Id_Riv: Nullable<number>;
}

export interface AlimenterData {
  Id_Bat: Nullable<number>;
  Id_Reseaux: Nullable<number>;
}

export interface ContenirData {
  Id_Parcel: Nullable<number>;
  Id_Borne: Nullable<number>;
}

export interface TrouverData {
  Id_Parcel: Nullable<number>;
  Id_Infras: Nullable<number>;
}

export interface EclairerData {
  Id_Parcel: Nullable<number>;
  Id_Equip: Nullable<number>;
}

export interface DesservirData {
  Id_Parcel: Nullable<number>;
  Id_Rte: Nullable<number>;
}

export interface ApprovisionnerData {
  Id_Bat: Nullable<number>;
  Id_Reseaux: Nullable<number>;
}