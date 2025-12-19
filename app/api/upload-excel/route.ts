// app/api/upload-excel/route.ts
import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import prisma from '@/lib/prisma';
import {
  RouteData,
  RiviereData,
  EquipementData,
  InfrastructureData,
  BorneData,
  TaxeImmobiliereData,
  ReseauEnergetiqueData,
  ReseauEnEauData,
  RegionData,
  DepartementData,
  ArrondissementData,
  LotissementData,
  ParcelleData,
  BatimentData,
  PayerData,
  LimitropheData,
  AlimenterData,
  ContenirData,
  TrouverData,
  EclairerData,
  DesservirData,
  ApprovisionnerData,
} from './types';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('excelFile') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    await prisma.$transaction(async (tx) => {
      // Helper functions for type-safe conversion
      const toStr = (val: ExcelJS.CellValue): string | null => {
        if (val == null) return null;
        if (typeof val === 'string') return val;
        if (typeof val === 'number') return String(val);
        if (typeof val === 'boolean') return String(val);
        if (val instanceof Date) return val.toISOString();
        if (typeof val === 'object' && 'text' in val) return val.text;
        if (typeof val === 'object' && 'result' in val) return String(val.result);
        return String(val);
      };
      const toNum = (val: ExcelJS.CellValue): number | null => {
        if (val == null) return null;
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
          const n = Number(val);
          return isNaN(n) ? null : n;
        }
        if (typeof val === 'object' && 'result' in val) {
          const n = Number(val.result);
          return isNaN(n) ? null : n;
        }
        const n = Number(val);
        return isNaN(n) ? null : n;
      };
      const toBool = (val: ExcelJS.CellValue): boolean | null => {
        if (val == null) return null;
        if (typeof val === 'boolean') return val;
        if (typeof val === 'string') {
          const lower = val.toLowerCase();
          if (lower === 'true' || lower === '1' || lower === 'yes') return true;
          if (lower === 'false' || lower === '0' || lower === 'no') return false;
        }
        if (typeof val === 'number') return val !== 0;
        return Boolean(val);
      };
      const toDate = (val: ExcelJS.CellValue): Date | null => {
        if (val == null) return null;
        if (val instanceof Date) return val;
        if (typeof val === 'string') {
          const date = new Date(val);
          return isNaN(date.getTime()) ? null : date;
        }
        if (typeof val === 'number') {
          // Excel date serial number
          const date = new Date((val - 25569) * 86400 * 1000);
          return isNaN(date.getTime()) ? null : date;
        }
        return null;
      };

      const processSheet = <T>(
        sheetName: string,
        mapper: (row: ExcelJS.Row) => T | null
      ): T[] => {
        const sheet = workbook.getWorksheet(sheetName);
        if (!sheet) return [];
        const data: T[] = [];
        sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          if (rowNumber === 1) return; // skip header
          const item = mapper(row);
          if (item) data.push(item);
        });
        return data;
      };

      // Independent tables
      const routes = processSheet<{ Id_Rte: number; Cat_Rte: string | null; Type_Rte: string | null; Largeur_Rte: string | null; Etat_Rte: string | null; Mat_Rte: string | null; WKT_Geometry: string | null }>('Route', (row) => {
        const id = toNum(row.getCell(1).value);
        if (id === null) return null;
        return {
          Id_Rte: id,
          Cat_Rte: toStr(row.getCell(2).value),
          Type_Rte: toStr(row.getCell(3).value),
          Largeur_Rte: toStr(row.getCell(4).value),
          Etat_Rte: toStr(row.getCell(5).value),
          Mat_Rte: toStr(row.getCell(6).value),
          WKT_Geometry: toStr(row.getCell(7).value),
        };
      });
      if (routes.length > 0) {
        await tx.route.createMany({ data: routes, skipDuplicates: true });
      }

      const rivieres = processSheet<{ Id_Riv: number; Nom_Riv: string | null; Type_Riv: string | null; Etat_amenag: string | null; Debit_Riv: string | null; WKT_Geometry: string | null }>('Riviere', (row) => {
        const id = toNum(row.getCell(1).value);
        if (id === null) return null;
        return {
          Id_Riv: id,
          Nom_Riv: toStr(row.getCell(2).value),
          Type_Riv: toStr(row.getCell(3).value),
          Etat_amenag: toStr(row.getCell(4).value),
          Debit_Riv: toStr(row.getCell(5).value),
          WKT_Geometry: toStr(row.getCell(6).value),
        };
      });
      if (rivieres.length > 0) {
        await tx.riviere.createMany({ data: rivieres, skipDuplicates: true });
      }

      const equipements = processSheet<{ Id_Equip: number; Type_Equip: string | null; Design_Equip: string | null; Etat_Equip: string | null; Mat_Equip: string | null; WKT_Geometry: string | null }>('Equipement', (row) => {
        const id = toNum(row.getCell(1).value);
        if (id === null) return null;
        return {
          Id_Equip: id,
          Type_Equip: toStr(row.getCell(2).value),
          Design_Equip: toStr(row.getCell(3).value),
          Etat_Equip: toStr(row.getCell(4).value),
          Mat_Equip: toStr(row.getCell(5).value),
          WKT_Geometry: toStr(row.getCell(6).value),
        };
      });
      if (equipements.length > 0) {
        await tx.equipement.createMany({ data: equipements, skipDuplicates: true });
      }

      const infrastructures = processSheet<{ Id_Infras: number; Nom_infras: string | null; Type_Infraas: string | null; Categorie_infras: string | null; Cycle: string | null; Statut_infras: string | null; Standing: string | null; Video_URL: string | null; Image_URL_1: string | null; Image_URL_2: string | null; Image_URL_3: string | null; Image_URL_4: string | null; Image_URL_5: string | null; Image_URL_6: string | null; WKT_Geometry: string | null }>('Infrastructure', (row) => {
        const id = toNum(row.getCell(1).value);
        if (id === null) return null;
        return {
          Id_Infras: id,
          Nom_infras: toStr(row.getCell(2).value),
          Type_Infraas: toStr(row.getCell(3).value),
          Categorie_infras: toStr(row.getCell(4).value),
          Cycle: toStr(row.getCell(5).value),
          Statut_infras: toStr(row.getCell(6).value),
          Standing: toStr(row.getCell(7).value),
          Video_URL: toStr(row.getCell(8).value),
          Image_URL_1: toStr(row.getCell(9).value),
          Image_URL_2: toStr(row.getCell(10).value),
          Image_URL_3: toStr(row.getCell(11).value),
          Image_URL_4: toStr(row.getCell(12).value),
          Image_URL_5: toStr(row.getCell(13).value),
          Image_URL_6: toStr(row.getCell(14).value),
          WKT_Geometry: toStr(row.getCell(15).value),
        };
      });
      if (infrastructures.length > 0) {
        await tx.infrastructure.createMany({ data: infrastructures, skipDuplicates: true });
      }

      const bornes = processSheet<{ Id_Borne: number; coord_x: number | null; coord_y: number | null; coord_z: number | null; WKT_Geometry: string | null }>('Borne', (row) => {
        const id = toNum(row.getCell(1).value);
        if (id === null) return null;
        return {
          Id_Borne: id,
          coord_x: toNum(row.getCell(2).value),
          coord_y: toNum(row.getCell(3).value),
          coord_z: toNum(row.getCell(4).value),
          WKT_Geometry: toStr(row.getCell(5).value),
        };
      });
      if (bornes.length > 0) {
        await tx.borne.createMany({ data: bornes, skipDuplicates: true });
      }

      const taxes = processSheet<{ Id_Taxe: number; Num_TF: string | null; Nom_Proprio: string | null; NIU: string | null; Val_imm: number | null; Taxe_Payee: boolean | null; Date_declaree: Date | null; Type_taxe: string | null }>('Taxe_immobiliere', (row) => {
        const id = toNum(row.getCell(1).value);
        if (id === null) return null;
        return {
          Id_Taxe: id,
          Num_TF: toStr(row.getCell(2).value),
          Nom_Proprio: toStr(row.getCell(3).value),
          NIU: toStr(row.getCell(4).value),
          Val_imm: toNum(row.getCell(5).value),
          Taxe_Payee: toBool(row.getCell(6).value),
          Date_declaree: toDate(row.getCell(7).value),
          Type_taxe: toStr(row.getCell(8).value),
        };
      });
      if (taxes.length > 0) {
        await tx.taxe_immobiliere.createMany({ data: taxes, skipDuplicates: true });
      }

      const reseauxEnergetique = processSheet<{ Id_Reseaux: number; Source_Res: number | null; Type_Reseau: string | null; Etat_Res: string | null; Materiau: string | null; WKT_Geometry: string | null }>('Reseau_energetique', (row) => {
        const id = toNum(row.getCell(1).value);
        if (id === null) return null;
        return {
          Id_Reseaux: id,
          Source_Res: toNum(row.getCell(2).value),
          Type_Reseau: toStr(row.getCell(3).value),
          Etat_Res: toStr(row.getCell(4).value),
          Materiau: toStr(row.getCell(5).value),
          WKT_Geometry: toStr(row.getCell(6).value),
        };
      });
      if (reseauxEnergetique.length > 0) {
        await tx.reseau_energetique.createMany({ data: reseauxEnergetique, skipDuplicates: true });
      }

      const reseauxEau = processSheet<{ Id_Reseaux: number; Source_Res: number | null; Type_Res: string | null; Etat_Res: string | null; Mat_Res: string | null; WKT_Geometry: string | null }>('Reseau_en_eau', (row) => {
        const id = toNum(row.getCell(1).value);
        if (id === null) return null;
        return {
          Id_Reseaux: id,
          Source_Res: toNum(row.getCell(2).value),
          Type_Res: toStr(row.getCell(3).value),
          Etat_Res: toStr(row.getCell(4).value),
          Mat_Res: toStr(row.getCell(5).value),
          WKT_Geometry: toStr(row.getCell(6).value),
        };
      });
      if (reseauxEau.length > 0) {
        await tx.reseau_en_eau.createMany({ data: reseauxEau, skipDuplicates: true });
      }

      // Hierarchical tables
      const regions = processSheet<{ Id_Reg: number; Nom_Reg: string | null; Sup_Reg: number | null; Chef_lieu_Reg: string | null; WKT_Geometry: string | null }>('Region', (row) => {
        const id = toNum(row.getCell(1).value);
        if (id === null) return null;
        return {
          Id_Reg: id,
          Nom_Reg: toStr(row.getCell(2).value),
          Sup_Reg: toNum(row.getCell(3).value),
          Chef_lieu_Reg: toStr(row.getCell(4).value),
          WKT_Geometry: toStr(row.getCell(5).value),
        };
      });
      if (regions.length > 0) {
        await tx.region.createMany({ data: regions, skipDuplicates: true });
      }

      const departements = processSheet<{ Id_Dept: number; Nom_Dept: string | null; Sup_Dept: number | null; Chef_lieu_Dept: string | null; Id_Reg: number | null; WKT_Geometry: string | null }>('Departement', (row) => {
        const id = toNum(row.getCell(1).value);
        if (id === null) return null;
        return {
          Id_Dept: id,
          Nom_Dept: toStr(row.getCell(2).value),
          Sup_Dept: toNum(row.getCell(3).value),
          Chef_lieu_Dept: toStr(row.getCell(4).value),
          Id_Reg: toNum(row.getCell(5).value),
          WKT_Geometry: toStr(row.getCell(6).value),
        };
      });
      if (departements.length > 0) {
        await tx.departement.createMany({ data: departements, skipDuplicates: true });
      }

      const arrondissements = processSheet<{ Id_Arrond: number; Nom_Arrond: string | null; Sup_Arrond: number | null; Chef_lieu_Arrond: string | null; Commune: string | null; Id_Dept: number | null; WKT_Geometry: string | null }>('Arrondissement', (row) => {
        const id = toNum(row.getCell(1).value);
        if (id === null) return null;
        return {
          Id_Arrond: id,
          Nom_Arrond: toStr(row.getCell(2).value),
          Sup_Arrond: toNum(row.getCell(3).value),
          Chef_lieu_Arrond: toStr(row.getCell(4).value),
          Commune: toStr(row.getCell(5).value),
          Id_Dept: toNum(row.getCell(6).value),
          WKT_Geometry: toStr(row.getCell(7).value),
        };
      });
      if (arrondissements.length > 0) {
        await tx.arrondissement.createMany({ data: arrondissements, skipDuplicates: true });
      }

      const lotissements = processSheet<{ Id_Lotis: number; Nom_proprio: string | null; Num_TF: string | null; Statut: string | null; Nom_cons: string | null; Surface: number | null; Nom_visa_lotis: string | null; Date_approb: Date | null; Geo_exe: string | null; Nbre_lots: number | null; Lieudit: string | null; Echelle: number | null; Ccp: string | null; Video_URL: string | null; Image_URL_1: string | null; Image_URL_2: string | null; Image_URL_3: string | null; Image_URL_4: string | null; Image_URL_5: string | null; Image_URL_6: string | null; Id_Arrond: number | null; WKT_Geometry: string | null }>('Lotissement', (row) => {
        const id = toNum(row.getCell(1).value);
        if (id === null) return null;
        return {
          Id_Lotis: id,
          Nom_proprio: toStr(row.getCell(2).value),
          Num_TF: toStr(row.getCell(3).value),
          Statut: toStr(row.getCell(4).value),
          Nom_cons: toStr(row.getCell(5).value),
          Surface: toNum(row.getCell(6).value),
          Nom_visa_lotis: toStr(row.getCell(7).value),
          Date_approb: toDate(row.getCell(8).value),
          Geo_exe: toStr(row.getCell(9).value),
          Nbre_lots: toNum(row.getCell(10).value),
          Lieudit: toStr(row.getCell(11).value),
          Echelle: toNum(row.getCell(12).value),
          Ccp: toStr(row.getCell(13).value),
          Video_URL: toStr(row.getCell(14).value),
          Image_URL_1: toStr(row.getCell(15).value),
          Image_URL_2: toStr(row.getCell(16).value),
          Image_URL_3: toStr(row.getCell(17).value),
          Image_URL_4: toStr(row.getCell(18).value),
          Image_URL_5: toStr(row.getCell(19).value),
          Image_URL_6: toStr(row.getCell(20).value),
          Id_Arrond: toNum(row.getCell(21).value),
          WKT_Geometry: toStr(row.getCell(22).value),
        };
      });
      if (lotissements.length > 0) {
        await tx.lotissement.createMany({ data: lotissements, skipDuplicates: true });
      }

      const parcelles = processSheet<{ Id_Parcel: number; Nom_Prop: string | null; TF_Mere: string | null; Mode_Obtent: string | null; TF_Cree: string | null; Nom_Cons: string | null; Sup: number | null; Nom_Visa_Cad: string | null; Date_visa: Date | null; Geometre: string | null; Date_impl: Date | null; Num_lot: string | null; Num_bloc: string | null; Lieu_dit: string | null; Largeur_Rte: string | null; Echelle: number | null; Ccp_N: string | null; Mise_Val: boolean | null; Cloture: boolean | null; Video_URL: string | null; Image_URL_1: string | null; Image_URL_2: string | null; Image_URL_3: string | null; Image_URL_4: string | null; Image_URL_5: string | null; Image_URL_6: string | null; Id_Lotis: number | null; WKT_Geometry: string | null }>('Parcelle', (row) => {
        const id = toNum(row.getCell(1).value);
        if (id === null) return null;
        return {
          Id_Parcel: id,
          Nom_Prop: toStr(row.getCell(2).value),
          TF_Mere: toStr(row.getCell(3).value),
          Mode_Obtent: toStr(row.getCell(4).value),
          TF_Cree: toStr(row.getCell(5).value),
          Nom_Cons: toStr(row.getCell(6).value),
          Sup: toNum(row.getCell(7).value),
          Nom_Visa_Cad: toStr(row.getCell(8).value),
          Date_visa: toDate(row.getCell(9).value),
          Geometre: toStr(row.getCell(10).value),
          Date_impl: toDate(row.getCell(11).value),
          Num_lot: toStr(row.getCell(12).value),
          Num_bloc: toStr(row.getCell(13).value),
          Lieu_dit: toStr(row.getCell(14).value),
          Largeur_Rte: toStr(row.getCell(15).value),
          Echelle: toNum(row.getCell(16).value),
          Ccp_N: toStr(row.getCell(17).value),
          Mise_Val: toBool(row.getCell(18).value),
          Cloture: toBool(row.getCell(19).value),
          Video_URL: toStr(row.getCell(20).value),
          Image_URL_1: toStr(row.getCell(21).value),
          Image_URL_2: toStr(row.getCell(22).value),
          Image_URL_3: toStr(row.getCell(23).value),
          Image_URL_4: toStr(row.getCell(24).value),
          Image_URL_5: toStr(row.getCell(25).value),
          Image_URL_6: toStr(row.getCell(26).value),
          Id_Lotis: toNum(row.getCell(27).value),
          WKT_Geometry: toStr(row.getCell(28).value),
        };
      });
      if (parcelles.length > 0) {
        await tx.parcelle.createMany({ data: parcelles, skipDuplicates: true });
      }

      const batiments = processSheet<{ Id_Bat: number; Type_Usage: string | null; Cat_Bat: string | null; Status: string | null; Standing: string | null; Cloture: boolean | null; No_Permis: string | null; Type_Lodg: string | null; Etat_Bat: string | null; Nom: string | null; Mat_Bati: string | null; Video_URL: string | null; Image_URL_1: string | null; Image_URL_2: string | null; Image_URL_3: string | null; Image_URL_4: string | null; Image_URL_5: string | null; Image_URL_6: string | null; Id_Parcel: number | null; WKT_Geometry: string | null }>('Batiment', (row) => {
        const id = toNum(row.getCell(1).value);
        if (id === null) return null;
        return {
          Id_Bat: id,
          Type_Usage: toStr(row.getCell(2).value),
          Cat_Bat: toStr(row.getCell(3).value),
          Status: toStr(row.getCell(4).value),
          Standing: toStr(row.getCell(5).value),
          Cloture: toBool(row.getCell(6).value),
          No_Permis: toStr(row.getCell(7).value),
          Type_Lodg: toStr(row.getCell(8).value),
          Etat_Bat: toStr(row.getCell(9).value),
          Nom: toStr(row.getCell(10).value),
          Mat_Bati: toStr(row.getCell(11).value),
          Video_URL: toStr(row.getCell(12).value),
          Image_URL_1: toStr(row.getCell(13).value),
          Image_URL_2: toStr(row.getCell(14).value),
          Image_URL_3: toStr(row.getCell(15).value),
          Image_URL_4: toStr(row.getCell(16).value),
          Image_URL_5: toStr(row.getCell(17).value),
          Image_URL_6: toStr(row.getCell(18).value),
          Id_Parcel: toNum(row.getCell(19).value),
          WKT_Geometry: toStr(row.getCell(20).value),
        };
      });
      if (batiments.length > 0) {
        await tx.batiment.createMany({ data: batiments, skipDuplicates: true });
      }

      // Relationship tables - filter out null foreign keys
      const payersLoose = processSheet<{ Id_Parcel: number | null; Id_Bat: number | null; Id_Taxe: number | null; date_paye: number | null }>('Payer', (row) => ({
        Id_Parcel: toNum(row.getCell(1).value),
        Id_Bat: toNum(row.getCell(2).value),
        Id_Taxe: toNum(row.getCell(3).value),
        date_paye: toNum(row.getCell(4).value),
      }));
      const payers = payersLoose.filter((p): p is { Id_Parcel: number; Id_Bat: number; Id_Taxe: number; date_paye: number | null } =>
        p.Id_Parcel !== null && p.Id_Bat !== null && p.Id_Taxe !== null
      );
      if (payers.length > 0) {
        await tx.payer.createMany({ data: payers, skipDuplicates: true });
      }

      const limitrophesLoose = processSheet<{ Id_Lotis: number | null; Id_Riv: number | null }>('Limitrophe', (row) => ({
        Id_Lotis: toNum(row.getCell(1).value),
        Id_Riv: toNum(row.getCell(2).value),
      }));
      const limitrophes = limitrophesLoose.filter((l): l is { Id_Lotis: number; Id_Riv: number } =>
        l.Id_Lotis !== null && l.Id_Riv !== null
      );
      if (limitrophes.length > 0) {
        await tx.limitrophe.createMany({ data: limitrophes, skipDuplicates: true });
      }

      const alimentersLoose = processSheet<{ Id_Bat: number | null; Id_Reseaux: number | null }>('Alimenter', (row) => ({
        Id_Bat: toNum(row.getCell(1).value),
        Id_Reseaux: toNum(row.getCell(2).value),
      }));
      const alimenters = alimentersLoose.filter((a): a is { Id_Bat: number; Id_Reseaux: number } =>
        a.Id_Bat !== null && a.Id_Reseaux !== null
      );
      if (alimenters.length > 0) {
        await tx.alimenter.createMany({ data: alimenters, skipDuplicates: true });
      }

      const contenirsLoose = processSheet<{ Id_Parcel: number | null; Id_Borne: number | null }>('Contenir', (row) => ({
        Id_Parcel: toNum(row.getCell(1).value),
        Id_Borne: toNum(row.getCell(2).value),
      }));
      const contenirs = contenirsLoose.filter((c): c is { Id_Parcel: number; Id_Borne: number } =>
        c.Id_Parcel !== null && c.Id_Borne !== null
      );
      if (contenirs.length > 0) {
        await tx.contenir.createMany({ data: contenirs, skipDuplicates: true });
      }

      const trouvrsLoose = processSheet<{ Id_Parcel: number | null; Id_Infras: number | null }>('Trouver', (row) => ({
        Id_Parcel: toNum(row.getCell(1).value),
        Id_Infras: toNum(row.getCell(2).value),
      }));
      const trouvrs = trouvrsLoose.filter((t): t is { Id_Parcel: number; Id_Infras: number } =>
        t.Id_Parcel !== null && t.Id_Infras !== null
      );
      if (trouvrs.length > 0) {
        await tx.trouver.createMany({ data: trouvrs, skipDuplicates: true });
      }

      const eclairersLoose = processSheet<{ Id_Parcel: number | null; Id_Equip: number | null }>('Eclairer', (row) => ({
        Id_Parcel: toNum(row.getCell(1).value),
        Id_Equip: toNum(row.getCell(2).value),
      }));
      const eclairers = eclairersLoose.filter((e): e is { Id_Parcel: number; Id_Equip: number } =>
        e.Id_Parcel !== null && e.Id_Equip !== null
      );
      if (eclairers.length > 0) {
        await tx.eclairer.createMany({ data: eclairers, skipDuplicates: true });
      }

      const desservirsLoose = processSheet<{ Id_Parcel: number | null; Id_Rte: number | null }>('Desservir', (row) => ({
        Id_Parcel: toNum(row.getCell(1).value),
        Id_Rte: toNum(row.getCell(2).value),
      }));
      const desservirs = desservirsLoose.filter((d): d is { Id_Parcel: number; Id_Rte: number } =>
        d.Id_Parcel !== null && d.Id_Rte !== null
      );
      if (desservirs.length > 0) {
        await tx.desservir.createMany({ data: desservirs, skipDuplicates: true });
      }

      const approvisionnersLoose = processSheet<{ Id_Bat: number | null; Id_Reseaux: number | null }>('Approvisionner', (row) => ({
        Id_Bat: toNum(row.getCell(1).value),
        Id_Reseaux: toNum(row.getCell(2).value),
      }));
      const approvisionners = approvisionnersLoose.filter((a): a is { Id_Bat: number; Id_Reseaux: number } =>
        a.Id_Bat !== null && a.Id_Reseaux !== null
      );
      if (approvisionners.length > 0) {
        await tx.approvisionner.createMany({ data: approvisionners, skipDuplicates: true });
      }
    });

    return NextResponse.json({
      success: true,
      message: 'All data imported successfully!'
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      error: 'Import failed',
      details: message
    }, { status: 500 });
  }
}

