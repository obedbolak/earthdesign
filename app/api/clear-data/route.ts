// e.g., app/api/clear-data/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    await prisma.$transaction([
      prisma.payer.deleteMany(),
      prisma.limitrophe.deleteMany(),
      prisma.alimenter.deleteMany(),
      prisma.contenir.deleteMany(),
      prisma.trouver.deleteMany(),
      prisma.eclairer.deleteMany(),
      prisma.desservir.deleteMany(),
      prisma.approvisionner.deleteMany(),

      prisma.batiment.deleteMany(),
      prisma.parcelle.deleteMany(),
      prisma.lotissement.deleteMany(),
      prisma.arrondissement.deleteMany(),
      prisma.departement.deleteMany(),
      prisma.region.deleteMany(),

      prisma.route.deleteMany(),
      prisma.riviere.deleteMany(),
      prisma.equipement.deleteMany(),
      prisma.infrastructure.deleteMany(),
      prisma.borne.deleteMany(),
      prisma.taxe_immobiliere.deleteMany(),
      prisma.reseau_energetique.deleteMany(),
      prisma.reseau_en_eau.deleteMany(),
    ]);

    return NextResponse.json({ success: true, message: 'All data deleted successfully!' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clear data' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';