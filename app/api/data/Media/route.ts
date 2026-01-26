import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all media (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");

    const where: any = {};

    if (entityType) {
      where.entityType = entityType;
    }
    if (entityId) {
      where.entityId = parseInt(entityId);
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
      propertyId,
      lotissementId,
      parcelleId,
      batimentId,
      infrastructureId,
    } = body;

    if (!entityType || entityId === undefined || !url || !type) {
      return NextResponse.json(
        { error: "entityType, entityId, url, and type are required" },
        { status: 400 },
      );
    }

    // Get the next order number
    const lastMedia = await prisma.media.findFirst({
      where: { entityType, entityId: parseInt(entityId) },
      orderBy: { order: "desc" },
    });
    const nextOrder =
      order !== undefined ? parseInt(order) : (lastMedia?.order ?? -1) + 1;

    // Try to create, with retry logic for sequence issues
    let media;
    let retries = 3;

    while (retries > 0) {
      try {
        media = await prisma.media.create({
          data: {
            entityType,
            entityId: parseInt(entityId),
            url,
            type,
            order: nextOrder,
            propertyId: propertyId ? parseInt(propertyId) : null,
            lotissementId: lotissementId ? parseInt(lotissementId) : null,
            parcelleId: parcelleId ? parseInt(parcelleId) : null,
            batimentId: batimentId ? parseInt(batimentId) : null,
            infrastructureId: infrastructureId
              ? parseInt(infrastructureId)
              : null,
          },
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
