// app/api/data/[table]/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const modelMap: Record<string, any> = {
  Region: prisma.region,
  Departement: prisma.departement,
  Arrondissement: prisma.arrondissement,
  Lotissement: prisma.lotissement,
  Parcelle: prisma.parcelle,
  Batiment: prisma.batiment,
  Route: prisma.route,
  Riviere: prisma.riviere,
  Taxe_immobiliere: prisma.taxe_immobiliere,
  Equipement: prisma.equipement,
  Reseau_energetique: prisma.reseau_energetique,
  Reseau_en_eau: prisma.reseau_en_eau,
  Infrastructure: prisma.infrastructure,
  Borne: prisma.borne,
};

const getIdField = (table: string) => `Id_${table}`;

export async function DELETE(
  request: Request,
  context: { params: Promise<{ table: string; id: string }> }
) {
  const params = await context.params;
  const { table, id } = params;

  const model = modelMap[table];
  if (!model) return NextResponse.json({ error: "Invalid table" }, { status: 404 });

  try {
    await model.delete({
      where: { [getIdField(table)]: parseInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ table: string; id: string }> }
) {
  const params = await context.params;
  const { table, id } = params;
  const body = await request.json();

  const model = modelMap[table];
  if (!model) return NextResponse.json({ error: "Invalid table" }, { status: 404 });

  try {
    await model.update({
      where: { [getIdField(table)]: parseInt(id) },
      data: body,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}