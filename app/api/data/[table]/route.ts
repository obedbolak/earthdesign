// app/api/data/[table]/route.ts  (keep this one, delete the other)
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/* =========================================================
 * 1.  whitelist of allowed tables
 * ========================================================= */
const modelMap: Record<string, keyof typeof prisma> = {
  region: 'region',
  departement: 'departement',
  arrondissement: 'arrondissement',
  lotissement: 'lotissement',
  parcelle: 'parcelle',
  batiment: 'batiment',
  route: 'route',
  riviere: 'riviere',
  taxe_immobiliere: 'taxe_immobiliere',
  equipement: 'equipement',
  reseau_energetique: 'reseau_energetique',
  reseau_en_eau: 'reseau_en_eau',
  infrastructure: 'infrastructure',
  borne: 'borne',
  property: 'property',
};

/* =========================================================
 * 2.  primary-key column names exactly as defined in schema.prisma
 * ========================================================= */
const primaryKeyMap: Record<string, string> = {
  region: 'Id_Reg',
  departement: 'Id_Dept',      // ← not Id_Dep
  arrondissement: 'Id_Arrond', // ← not Id_Arr
  lotissement: 'Id_Lotis',     // ← not Id_Lot
  parcelle: 'Id_Parcel',       // ← not Id_Par
  batiment: 'Id_Bat',
  route: 'Id_Rte',
  riviere: 'Id_Riv',
  taxe_immobiliere: 'Id_Taxe',
  equipement: 'Id_Equip',
  reseau_energetique: 'Id_Reseaux',
  reseau_en_eau: 'Id_Reseaux',
  infrastructure: 'Id_Infras',
  borne: 'Id_Borne',
  property: 'id',
};

/* =========================================================
 * 3.  reusable helper – converts id once for PATCH / DELETE
 * ========================================================= */
function coerceId(idStr: string, table: string): string | number {
  return primaryKeyMap[table] === 'id' ? idStr : Number(idStr);
}

/* =========================================================
 * 4.  GET
 * ========================================================= */
export async function GET(
  _: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;
  if (!table) return NextResponse.json({ error: 'No table specified' }, { status: 400 });

  const modelName = modelMap[table.toLowerCase()];
  const primaryKey = primaryKeyMap[table.toLowerCase()];
  if (!modelName || !primaryKey)
    return NextResponse.json({ error: `Invalid table: ${table}` }, { status: 400 });

  const model = (prisma as any)[modelName];
  const include = table.toLowerCase() === 'property' ? { parcelle: true, batiment: true } : undefined;

  const records = await model.findMany({ include, orderBy: { [primaryKey]: 'asc' } });
  return NextResponse.json({ data: records, count: records.length });
}

/* =========================================================
 * 5.  POST
 * ========================================================= */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;
  if (!table) return NextResponse.json({ error: 'No table specified' }, { status: 400 });

  const modelName = modelMap[table.toLowerCase()];
  if (!modelName) return NextResponse.json({ error: `Invalid table: ${table}` }, { status: 400 });

  const body = await request.json();
  const model = (prisma as any)[modelName];
  const record = await model.create({ data: body });
  return NextResponse.json(record, { status: 201 });
}

/* =========================================================
 * 6.  PATCH
 * ========================================================= */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;
  const id = new URL(request.url).searchParams.get('id');
  if (!table || !id) return NextResponse.json({ error: 'Table and ID are required' }, { status: 400 });

  const modelName = modelMap[table.toLowerCase()];
  const primaryKey = primaryKeyMap[table.toLowerCase()];
  if (!modelName || !primaryKey) return NextResponse.json({ error: `Invalid table: ${table}` }, { status: 400 });

  const body = await request.json();
  const model = (prisma as any)[modelName];
  const record = await model.update({
    where: { [primaryKey]: coerceId(id, table.toLowerCase()) },
    data: body,
  });
  return NextResponse.json(record);
}

/* =========================================================
 * 7.  DELETE
 * ========================================================= */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;
  const id = new URL(request.url).searchParams.get('id');
  if (!table || !id) return NextResponse.json({ error: 'Table and ID are required' }, { status: 400 });

  const modelName = modelMap[table.toLowerCase()];
  const primaryKey = primaryKeyMap[table.toLowerCase()];
  if (!modelName || !primaryKey) return NextResponse.json({ error: `Invalid table: ${table}` }, { status: 400 });

  const model = (prisma as any)[modelName];
  await model.delete({ where: { [primaryKey]: coerceId(id, table.toLowerCase()) } });
  return NextResponse.json({ message: 'Record deleted successfully' });
}