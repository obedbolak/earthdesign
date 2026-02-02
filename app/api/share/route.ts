// app/api/share/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entityType, entityId, platform } = body;

    // Validate input
    if (!entityType || !entityId || !platform) {
      return NextResponse.json(
        { error: "Missing required fields: entityType, entityId, platform" },
        { status: 400 },
      );
    }

    // Validate entityType
    const validEntityTypes = ["LOTISSEMENT", "PARCELLE", "BATIMENT"];
    if (!validEntityTypes.includes(entityType)) {
      return NextResponse.json(
        { error: "Invalid entityType" },
        { status: 400 },
      );
    }

    // Get session (optional - shares can be anonymous)
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    const id = parseInt(entityId);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid entityId" }, { status: 400 });
    }

    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Build share data based on entity type
      const shareData: any = {
        userId,
        entityType,
        platform,
      };

      // Set the appropriate entity ID and increment share count
      if (entityType === "LOTISSEMENT") {
        // Check if entity exists
        const lotissement = await tx.lotissement.findUnique({
          where: { Id_Lotis: id },
        });
        if (!lotissement) {
          throw new Error("Lotissement not found");
        }

        shareData.lotissementId = id;

        await tx.lotissement.update({
          where: { Id_Lotis: id },
          data: { shareCount: { increment: 1 } },
        });
      } else if (entityType === "PARCELLE") {
        const parcelle = await tx.parcelle.findUnique({
          where: { Id_Parcel: id },
        });
        if (!parcelle) {
          throw new Error("Parcelle not found");
        }

        shareData.parcelleId = id;

        await tx.parcelle.update({
          where: { Id_Parcel: id },
          data: { shareCount: { increment: 1 } },
        });
      } else if (entityType === "BATIMENT") {
        const batiment = await tx.batiment.findUnique({
          where: { Id_Bat: id },
        });
        if (!batiment) {
          throw new Error("Batiment not found");
        }

        shareData.batimentId = id;

        await tx.batiment.update({
          where: { Id_Bat: id },
          data: { shareCount: { increment: 1 } },
        });
      }

      // Create share record
      const share = await tx.share.create({
        data: shareData,
      });

      return share;
    });

    return NextResponse.json({
      success: true,
      share: result,
      message: `Successfully shared to ${platform}`,
    });
  } catch (error) {
    console.error("Share error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to record share";
    const status = message.includes("not found") ? 404 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

// GET - Fetch share statistics for an entity
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: "Missing entityType or entityId" },
        { status: 400 },
      );
    }

    const id = parseInt(entityId);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid entityId" }, { status: 400 });
    }

    // Build where clause based on entity type
    const whereClause: any = { entityType };

    if (entityType === "LOTISSEMENT") {
      whereClause.lotissementId = id;
    } else if (entityType === "PARCELLE") {
      whereClause.parcelleId = id;
    } else if (entityType === "BATIMENT") {
      whereClause.batimentId = id;
    }

    // Get share count by platform
    const shares = await prisma.share.groupBy({
      by: ["platform"],
      where: whereClause,
      _count: {
        platform: true,
      },
    });

    // Get total shares
    const totalShares = await prisma.share.count({
      where: whereClause,
    });

    // Get recent shares
    const recentShares = await prisma.share.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: {
          select: { name: true, image: true },
        },
      },
    });

    // Format platform stats
    const platformStats = shares.reduce(
      (acc, share) => {
        if (share.platform) {
          acc[share.platform] = share._count.platform;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    return NextResponse.json({
      total: totalShares,
      byPlatform: platformStats,
      recent: recentShares,
    });
  } catch (error) {
    console.error("Share stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch share stats" },
      { status: 500 },
    );
  }
}
