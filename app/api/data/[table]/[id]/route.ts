// app/api/data/[table]/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { request } from 'http';

/* -------------------------------------------------
 * 1.  same maps as the first file – keeps life easy
 * ------------------------------------------------- */
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

const primaryKeyMap: Record<string, string> = {
  region: 'Id_Reg',
  departement: 'Id_Dept',
  arrondissement: 'Id_Arrond',
  lotissement: 'Id_Lotis',
  parcelle: 'Id_Parcel',
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

/* -------------------------------------------------
 * 2.  id coercion (string for property, number for rest)
 * ------------------------------------------------- */
function coerceId(idStr: string, table: string): string | number {
  return primaryKeyMap[table] === 'id' ? idStr : Number(idStr);
}

/* -------------------------------------------------
 * 3.  PATCH  (returns updated row)
 * ------------------------------------------------- */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ table: string; id: string }> }
) {
  const { table, id } = await params;
  if (!table || !id)
    return NextResponse.json({ error: 'table and id required' }, { status: 400 });

  const modelName = modelMap[table.toLowerCase()];
  const primaryKey = primaryKeyMap[table.toLowerCase()];
  if (!modelName || !primaryKey)
    return NextResponse.json({ error: 'Invalid table' }, { status: 404 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // strip PK from payload to avoid “trying to update id” error
  const { [primaryKey]: _, ...updateData } = body;

  try {
    const model = (prisma as any)[modelName];
    const updated = await model.update({
      where: { [primaryKey]: coerceId(id, table.toLowerCase()) },
      data: updateData,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(`PATCH ${table}/${id}`, error);
    return NextResponse.json(
      { error: 'Update failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------
 * 4.  DELETE
 * ------------------------------------------------- */
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ table: string; id: string }> }
) {
  const { table, id } = await params;
  if (!table || !id)
    return NextResponse.json({ error: 'table and id required' }, { status: 400 });

  const modelName = modelMap[table.toLowerCase()];
  const primaryKey = primaryKeyMap[table.toLowerCase()];
  if (!modelName || !primaryKey)
    return NextResponse.json({ error: 'Invalid table' }, { status: 404 });

  try {
    const model = (prisma as any)[modelName];
    await model.delete({
      where: { [primaryKey]: coerceId(id, table.toLowerCase()) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE ${table}/${id}`, error);
    return NextResponse.json(
      { error: 'Delete failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}