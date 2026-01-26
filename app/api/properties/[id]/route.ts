// app/api/properties/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid property ID" },
        { status: 400 },
      );
    }

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        media: {
          orderBy: { order: "asc" },
        },
        parcelle: {
          include: {
            lotissement: {
              include: {
                arrondissement: {
                  include: {
                    departement: {
                      include: {
                        region: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        batiment: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 },
      );
    }

    // Also fetch media from Media table linked via entityType/entityId
    const additionalMedia = await prisma.media.findMany({
      where: {
        OR: [
          { propertyId: id },
          {
            entityType: "PROPERTY",
            entityId: id,
          },
        ],
      },
      orderBy: { order: "asc" },
    });

    // Merge and deduplicate media
    const relationMedia = property.media || [];
    const allMediaMap = new Map<number, any>();
    [...relationMedia, ...additionalMedia].forEach((m) => {
      if (!allMediaMap.has(m.id)) {
        allMediaMap.set(m.id, m);
      }
    });

    const allMedia = Array.from(allMediaMap.values()).sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );

    const parcelle = property.parcelle;
    const lotissement = parcelle?.lotissement;
    const arrondissement = lotissement?.arrondissement;
    const departement = arrondissement?.departement;
    const region = departement?.region;

    const transformedProperty = {
      id: property.id,
      title: property.title,
      shortDescription: property.shortDescription,
      description: property.description,
      price: property.price ? Number(property.price) : null,
      priceMin: property.priceMin ? Number(property.priceMin) : null,
      priceMax: property.priceMax ? Number(property.priceMax) : null,
      pricePerSqM: property.pricePerSqM ? Number(property.pricePerSqM) : null,
      currency: property.currency,
      type: property.type,
      forSale: property.forSale,
      forRent: property.forRent,
      rentPrice: property.rentPrice ? Number(property.rentPrice) : null,
      isLandForDevelopment: property.isLandForDevelopment,
      approvedForApartments: property.approvedForApartments,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      kitchens: property.kitchens,
      livingRooms: property.livingRooms,
      surfaceArea: property.surfaceArea,
      floorLevel: property.floorLevel,
      totalFloors: property.totalFloors,
      doorNumber: property.doorNumber,
      hasGenerator: property.hasGenerator,
      hasParking: property.hasParking,
      parkingSpaces: property.parkingSpaces,
      hasElevator: property.batiment?.hasElevator ?? null,
      totalUnits: property.batiment?.totalUnits ?? null,
      amenities: property.amenities,
      address: property.address,
      location: {
        lieudit: parcelle?.Lieu_dit ?? lotissement?.Lieudit ?? null,
        arrondissement: arrondissement?.Nom_Arrond ?? null,
        departement: departement?.Nom_Dept ?? null,
        region: region?.Nom_Reg ?? null,
      },
      parcelleId: property.parcelleId,
      batimentId: property.batimentId,
      media: allMedia.map((m) => ({
        id: m.id,
        url: m.url,
        type: m.type as "image" | "video",
        order: m.order ?? 0,
      })),
      published: property.published,
      featured: property.featured,
      createdAt: property.createdAt.toISOString(),
      updatedAt: property.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: transformedProperty,
    });
  } catch (error) {
    console.error("Error fetching property:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch property",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid property ID" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const {
      id: _,
      createdAt,
      updatedAt,
      media,
      parcelle,
      batiment,
      location,
      ...updateData
    } = body;

    const property = await prisma.property.update({
      where: { id },
      data: updateData,
      include: {
        media: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error("Error updating property:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update property",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid property ID" },
        { status: 400 },
      );
    }

    // Delete associated media first
    await prisma.media.deleteMany({
      where: {
        OR: [{ propertyId: id }, { entityType: "PROPERTY", entityId: id }],
      },
    });

    await prisma.property.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting property:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete property",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
