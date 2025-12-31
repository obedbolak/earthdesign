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

// Map table names to their actual ID field names
const idFieldMap: Record<string, string> = {
  Region: "Id_Reg",
  Departement: "Id_Dept",
  Arrondissement: "Id_Arrond",
  Lotissement: "Id_Lotis",
  Parcelle: "Id_Parcel",
  Batiment: "Id_Bat",
  Route: "Id_Rte",
  Riviere: "Id_Riv",
  Taxe_immobiliere: "Id_Taxe",
  Equipement: "Id_Equip",
  Reseau_energetique: "Id_Reseaux",
  Reseau_en_eau: "Id_Reseaux",
  Infrastructure: "Id_Infras",
  Borne: "Id_Borne",
};

const getIdField = (table: string) => idFieldMap[table] || `Id_${table}`;

export async function DELETE(
  request: Request,
  context: { params: Promise<{ table: string; id: string }> }
) {
  const params = await context.params;
  const { table, id } = params;
  
  const model = modelMap[table];
  if (!model) return NextResponse.json({ error: "Invalid table" }, { status: 404 });

  const idField = getIdField(table);
  
  try {
    await model.delete({
      where: { [idField]: parseInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
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

  const idField = getIdField(table);
  
  try {
    // Remove the ID field from the update data to avoid trying to update the primary key
    const { [idField]: _, ...updateData } = body;
    
    await model.update({
      where: { [idField]: parseInt(id) },
      data: updateData,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}