import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Make sure this points to your prisma instance

export async function GET() {
  try {
    // We use Promise.all to fetch all counts simultaneously (much faster than one by one)
    const [
      regions,
      departements,
      arrondissements,
      lotissements,
      parcelles,
      batiments,
      routes,
      rivieres,
      taxes,
      equipements,
      reseauxEnergetique,
      reseauxEau,
      infrastructures,
      bornes,
    ] = await Promise.all([
      prisma.region.count(),
      prisma.departement.count(),
      prisma.arrondissement.count(),
      prisma.lotissement.count(),
      prisma.parcelle.count(),
      prisma.batiment.count(),
      prisma.route.count(),
      prisma.riviere.count(),
      prisma.taxe_immobiliere.count(),
      prisma.equipement.count(),
      prisma.reseau_energetique.count(),
      prisma.reseau_en_eau.count(),
      prisma.infrastructure.count(),
      prisma.borne.count(),
    ]);

    // Calculate total for the "Total Records" card
    const totalRecords =
      regions +
      departements +
      arrondissements +
      lotissements +
      parcelles +
      batiments +
      routes +
      rivieres +
      taxes +
      equipements +
      reseauxEnergetique +
      reseauxEau +
      infrastructures +
      bornes;

    // Return the data structure your frontend expects
    return NextResponse.json({
      totalRecords,
      regions,
      departements,
      parcelles,
      batiments,
      taxes,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
