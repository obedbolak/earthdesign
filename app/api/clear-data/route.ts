// app/api/clear-data/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    // Delete in correct order: children before parents
    // Use sequential deletions to respect foreign key constraints

    // ========== PHASE 1: Relationship/Junction Tables ==========
    await prisma.payer.deleteMany();
    await prisma.limitrophe.deleteMany();
    await prisma.alimenter.deleteMany();
    await prisma.contenir.deleteMany();
    await prisma.trouver.deleteMany();
    await prisma.eclairer.deleteMany();
    await prisma.desservir.deleteMany();
    await prisma.approvisionner.deleteMany();

    // ========== PHASE 3: Geographic Hierarchy (reverse order) ==========
    await prisma.batiment.deleteMany(); // references Parcelle
    await prisma.parcelle.deleteMany(); // references Lotissement
    await prisma.lotissement.deleteMany(); // references Arrondissement
    await prisma.arrondissement.deleteMany(); // references Departement
    await prisma.departement.deleteMany(); // references Region
    await prisma.region.deleteMany();

    // ========== PHASE 4: Independent Tables ==========
    await prisma.route.deleteMany();
    await prisma.riviere.deleteMany();
    await prisma.equipement.deleteMany();
    await prisma.infrastructure.deleteMany();
    await prisma.borne.deleteMany();
    await prisma.taxe_immobiliere.deleteMany();
    await prisma.reseau_energetique.deleteMany();
    await prisma.reseau_en_eau.deleteMany();

    return NextResponse.json({
      success: true,
      message: "All data deleted successfully!",
    });
  } catch (error: any) {
    console.error("Clear data error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to clear data",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
