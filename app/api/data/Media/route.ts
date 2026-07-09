import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all media (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");

    const where: any = {};

    if (entityType && entityId) {
      const parsedId = parseInt(entityId);

      // Map entityType to the correct foreign key field
      switch (entityType.toUpperCase()) {
        case "LOTISSEMENT":
          where.lotissementId = parsedId;
          break;
        case "PARCELLE":
          where.parcelleId = parsedId;
          break;
        case "BATIMENT":
          where.batimentId = parsedId;
          break;
        case "INFRASTRUCTURE":
          where.infrastructureId = parsedId;
          break;
      }
    }

    const data = await prisma.media.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 },
    );
  }
}

// POST new media
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      entityType,
      entityId,
      url,
      type,
      order,
      lotissementId,
      parcelleId,
      batimentId,
      infrastructureId,
      caption,
      isPrimary,
    } = body;

    // Validate required fields
    if (!entityType || entityId === undefined || !url || !type) {
      return NextResponse.json(
        { error: "entityType, entityId, url, and type are required" },
        { status: 400 },
      );
    }

    // Validate entityType is a valid MediaEntityType
    const validEntityTypes = [
      "LOTISSEMENT",
      "PARCELLE",
      "BATIMENT",
      "INFRASTRUCTURE",
    ];
    if (!validEntityTypes.includes(entityType.toUpperCase())) {
      return NextResponse.json(
        {
          error: `Invalid entityType. Must be one of: ${validEntityTypes.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Build where clause for finding the last media
    const whereClause: any = {};
    const parsedEntityId = parseInt(entityId);

    switch (entityType.toUpperCase()) {
      case "LOTISSEMENT":
        whereClause.lotissementId = parsedEntityId;
        break;
      case "PARCELLE":
        whereClause.parcelleId = parsedEntityId;
        break;
      case "BATIMENT":
        whereClause.batimentId = parsedEntityId;
        break;
      case "INFRASTRUCTURE":
        whereClause.infrastructureId = parsedEntityId;
        break;
    }

    // Get the next order number
    const lastMedia = await prisma.media.findFirst({
      where: whereClause,
      orderBy: { order: "desc" },
    });

    const nextOrder =
      order !== undefined ? parseInt(order) : (lastMedia?.order ?? -1) + 1;

    // Build the data object for creation
    const createData: any = {
      entityType: entityType.toUpperCase(),
      url,
      type,
      order: nextOrder,
      caption: caption || null,
      isPrimary: isPrimary || false,
    };

    // Set the appropriate foreign key based on entityType
    // Use the provided specific ID if available, otherwise use entityId
    switch (entityType.toUpperCase()) {
      case "LOTISSEMENT":
        createData.lotissementId = lotissementId
          ? parseInt(lotissementId)
          : parsedEntityId;
        break;
      case "PARCELLE":
        createData.parcelleId = parcelleId
          ? parseInt(parcelleId)
          : parsedEntityId;
        break;
      case "BATIMENT":
        createData.batimentId = batimentId
          ? parseInt(batimentId)
          : parsedEntityId;
        break;
      case "INFRASTRUCTURE":
        createData.infrastructureId = infrastructureId
          ? parseInt(infrastructureId)
          : parsedEntityId;
        break;
    }

    // Try to create, with retry logic for sequence issues
    let media;
    let retries = 3;

    while (retries > 0) {
      try {
        media = await prisma.media.create({
          data: createData,
        });
        break; // Success, exit loop
      } catch (createError: any) {
        if (createError.code === "P2002" && retries > 1) {
          // Unique constraint error - try to fix the sequence
          console.log("Sequence conflict detected, attempting to fix...");
          try {
            // Reset the sequence using raw SQL
            await prisma.$executeRaw`
              SELECT setval(
                pg_get_serial_sequence('"Media"', 'id'), 
                COALESCE((SELECT MAX(id) FROM "Media"), 0) + 1, 
                false
              )
            `;
          } catch (seqError) {
            console.error("Failed to reset sequence:", seqError);
          }
          retries--;
          continue;
        }
        throw createError; // Re-throw if not a sequence issue or out of retries
      }
    }

    if (!media) {
      throw new Error("Failed to create media after retries");
    }

    return NextResponse.json({ data: media }, { status: 201 });
  } catch (error) {
    console.error("Error creating media:", error);
    return NextResponse.json(
      {
        error: "Failed to create media",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
