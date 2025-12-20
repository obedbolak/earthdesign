// app/api/data/[table]/route.ts
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

export async function GET(
  request: Request,
  context: { params: Promise<{ table: string }> }  // ← params is now a Promise
) {
  const params = await context.params;  // ← MUST await
  const table = params.table;

  console.log("🔍 API GET called for table:", table);

  if (!table) {
    return NextResponse.json({ error: "No table specified" }, { status: 400 });
  }

  const model = modelMap[table];

  if (!model) {
    console.log("❌ Table not found in modelMap:", table);
    return NextResponse.json({ error: "Table not found" }, { status: 404 });
  }

  try {
    const records = await model.findMany();
    console.log(`✅ Fetched ${records.length} records for ${table}`);
    return NextResponse.json({ data: records });
  } catch (error: any) {
    console.error("💥 Prisma error fetching", table, ":", error.message);
    return NextResponse.json(
      { error: "Database error", details: error.message },
      { status: 500 }
    );
  }
}