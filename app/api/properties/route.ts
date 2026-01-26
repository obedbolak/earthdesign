// app/api/properties/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Optional filters from query params
    const type = searchParams.get("type");
    const forSale = searchParams.get("forSale");
    const forRent = searchParams.get("forRent");
    const published = searchParams.get("published");
    const featured = searchParams.get("featured");
    const limit = searchParams.get("limit");

    // Build where clause
    const where: any = {};

    if (type && type !== "all") {
      where.type = type;
    }
    if (forSale !== null && forSale !== undefined) {
      where.forSale = forSale === "true";
    }
    if (forRent !== null && forRent !== undefined) {
      where.forRent = forRent === "true";
    }
    if (published !== null && published !== undefined) {
      where.published = published === "true";
    }
    if (featured !== null && featured !== undefined) {
      where.featured = featured === "true";
    }

    // Fetch properties with relations
    const properties = await prisma.property.findMany({
      where,
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
      orderBy: { createdAt: "desc" },
      ...(limit ? { take: parseInt(limit) } : {}),
    });

    // Also fetch media from the Media table that might be linked via entityType/entityId
    const propertyIds = properties.map((p) => p.id);

    // Fetch additional media linked via entityType = "PROPERTY"
    const additionalMedia = await prisma.media.findMany({
      where: {
        OR: [
          // Media linked directly via propertyId
          { propertyId: { in: propertyIds } },
          // Media linked via entityType/entityId
          {
            entityType: "PROPERTY",
            entityId: { in: propertyIds },
          },
        ],
      },
      orderBy: { order: "asc" },
    });

    // Create a map of propertyId to additional media
    const mediaByPropertyId = new Map<number, typeof additionalMedia>();
    additionalMedia.forEach((m) => {
      const propId =
        m.propertyId || (m.entityType === "PROPERTY" ? m.entityId : null);
      if (propId) {
        const existing = mediaByPropertyId.get(propId) || [];
        // Avoid duplicates
        if (!existing.some((e) => e.id === m.id)) {
          existing.push(m);
        }
        mediaByPropertyId.set(propId, existing);
      }
    });

    // Transform data to match frontend interface
    const transformedProperties = properties.map((property) => {
      const parcelle = property.parcelle;
      const lotissement = parcelle?.lotissement;
      const arrondissement = lotissement?.arrondissement;
      const departement = arrondissement?.departement;
      const region = departement?.region;

      // Combine media from relation and from Media table
      const relationMedia = property.media || [];
      const entityMedia = mediaByPropertyId.get(property.id) || [];

      // Merge and deduplicate
      const allMediaMap = new Map<number, any>();
      [...relationMedia, ...entityMedia].forEach((m) => {
        if (!allMediaMap.has(m.id)) {
          allMediaMap.set(m.id, m);
        }
      });

      const allMedia = Array.from(allMediaMap.values()).sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      );

      return {
        id: property.id,
        title: property.title,
        shortDescription: property.shortDescription,
        description: property.description,

        // Pricing - convert Decimal to number
        price: property.price ? Number(property.price) : null,
        priceMin: property.priceMin ? Number(property.priceMin) : null,
        priceMax: property.priceMax ? Number(property.priceMax) : null,
        pricePerSqM: property.pricePerSqM ? Number(property.pricePerSqM) : null,
        currency: property.currency,

        // Type & listing
        type: property.type,
        forSale: property.forSale,
        forRent: property.forRent,
        rentPrice: property.rentPrice ? Number(property.rentPrice) : null,

        // Land specifics
        isLandForDevelopment: property.isLandForDevelopment,
        approvedForApartments: property.approvedForApartments,

        // Unit features
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        kitchens: property.kitchens,
        livingRooms: property.livingRooms,
        surfaceArea: property.surfaceArea,
        floorLevel: property.floorLevel,
        totalFloors: property.totalFloors,
        doorNumber: property.doorNumber,

        // Amenities
        hasGenerator: property.hasGenerator,
        hasParking: property.hasParking,
        parkingSpaces: property.parkingSpaces,
        hasElevator: property.batiment?.hasElevator ?? null,
        totalUnits: property.batiment?.totalUnits ?? null,
        amenities: property.amenities,

        // Location
        address: property.address,
        location: {
          lieudit: parcelle?.Lieu_dit ?? lotissement?.Lieudit ?? null,
          arrondissement: arrondissement?.Nom_Arrond ?? null,
          departement: departement?.Nom_Dept ?? null,
          region: region?.Nom_Reg ?? null,
        },

        // Relations
        parcelleId: property.parcelleId,
        batimentId: property.batimentId,

        // Media - merged from both sources
        media: allMedia.map((m) => ({
          id: m.id,
          url: m.url,
          type: m.type as "image" | "video",
          order: m.order ?? 0,
        })),

        // Status
        published: property.published,
        featured: property.featured,

        // Timestamps
        createdAt: property.createdAt.toISOString(),
        updatedAt: property.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedProperties,
      total: transformedProperties.length,
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch properties",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
