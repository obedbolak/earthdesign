// app/api/favorites/check/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Check if specific items are favorited
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ favorites: {} });
    }

    const { searchParams } = new URL(request.url);
    const items = searchParams.get("items"); // Format: "BATIMENT:1,PARCELLE:2,LOTISSEMENT:3"

    if (!items) {
      // Return all favorite IDs grouped by type
      const favorites = await prisma.favorite.findMany({
        where: { userId: session.user.id },
        select: {
          entityType: true,
          lotissementId: true,
          parcelleId: true,
          batimentId: true,
        },
      });

      const favoriteMap: Record<string, number[]> = {
        LOTISSEMENT: [],
        PARCELLE: [],
        BATIMENT: [],
      };

      favorites.forEach((f) => {
        if (f.entityType === "LOTISSEMENT" && f.lotissementId) {
          favoriteMap.LOTISSEMENT.push(f.lotissementId);
        } else if (f.entityType === "PARCELLE" && f.parcelleId) {
          favoriteMap.PARCELLE.push(f.parcelleId);
        } else if (f.entityType === "BATIMENT" && f.batimentId) {
          favoriteMap.BATIMENT.push(f.batimentId);
        }
      });

      return NextResponse.json({ favorites: favoriteMap });
    }

    // Parse specific items to check
    const itemList = items.split(",").map((item) => {
      const [type, id] = item.split(":");
      return { type, id: parseInt(id) };
    });

    const results: Record<string, boolean> = {};

    for (const item of itemList) {
      const foreignKeyMap: Record<string, string> = {
        LOTISSEMENT: "lotissementId",
        PARCELLE: "parcelleId",
        BATIMENT: "batimentId",
      };
      const foreignKey = foreignKeyMap[item.type];

      if (foreignKey) {
        const exists = await prisma.favorite.findFirst({
          where: {
            userId: session.user.id,
            entityType: item.type as any,
            [foreignKey]: item.id,
          },
        });
        results[`${item.type}:${item.id}`] = !!exists;
      }
    }

    return NextResponse.json({ favorites: results });
  } catch (error) {
    console.error("[API] Check favorites error:", error);
    return NextResponse.json(
      { error: "Failed to check favorites" },
      { status: 500 },
    );
  }
}
