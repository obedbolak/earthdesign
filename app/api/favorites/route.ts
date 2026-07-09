// app/api/favorites/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Fetch all user favorites
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ data: [], count: 0 });
    }

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType");

    const where: any = { userId: session.user.id };
    if (entityType) {
      where.entityType = entityType;
    }

    const favorites = await prisma.favorite.findMany({
      where,
      include: {
        lotissement: {
          select: {
            Id_Lotis: true,
            title: true,
            slug: true,
            price: true,
            Surface: true,
            listingStatus: true,
            media: { where: { isPrimary: true }, take: 1 },
          },
        },
        parcelle: {
          select: {
            Id_Parcel: true,
            title: true,
            slug: true,
            price: true,
            Sup: true,
            listingStatus: true,
            media: { where: { isPrimary: true }, take: 1 },
          },
        },
        batiment: {
          select: {
            Id_Bat: true,
            title: true,
            slug: true,
            price: true,
            rentPrice: true,
            propertyType: true,
            bedrooms: true,
            bathrooms: true,
            surfaceArea: true,
            listingStatus: true,
            media: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      data: favorites,
      count: favorites.length,
    });
  } catch (error) {
    console.error("[API] GET favorites error:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 },
    );
  }
}

// POST - Add a favorite
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { entityType, entityId } = body;

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: "entityType and entityId are required" },
        { status: 400 },
      );
    }

    // Validate entityType
    if (!["LOTISSEMENT", "PARCELLE", "BATIMENT"].includes(entityType)) {
      return NextResponse.json(
        { error: "Invalid entityType" },
        { status: 400 },
      );
    }

    // Build the foreign key field name
    const foreignKeyMap: Record<string, string> = {
      LOTISSEMENT: "lotissementId",
      PARCELLE: "parcelleId",
      BATIMENT: "batimentId",
    };
    const foreignKey = foreignKeyMap[entityType];

    // Check if already favorited
    const existing = await prisma.favorite.findFirst({
      where: {
        userId: session.user.id,
        entityType: entityType as any,
        [foreignKey]: entityId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already in favorites", favorite: existing },
        { status: 409 },
      );
    }

    // Create favorite
    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        entityType: entityType as any,
        [foreignKey]: entityId,
      },
    });

    // Increment favoriteCount on the entity
    const modelMap: Record<string, any> = {
      LOTISSEMENT: prisma.lotissement,
      PARCELLE: prisma.parcelle,
      BATIMENT: prisma.batiment,
    };
    const primaryKeyMap: Record<string, string> = {
      LOTISSEMENT: "Id_Lotis",
      PARCELLE: "Id_Parcel",
      BATIMENT: "Id_Bat",
    };

    await modelMap[entityType].update({
      where: { [primaryKeyMap[entityType]]: entityId },
      data: { favoriteCount: { increment: 1 } },
    });

    return NextResponse.json(
      {
        data: favorite,
        message: "Added to favorites",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[API] POST favorite error:", error);
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 },
    );
  }
}

// DELETE - Remove a favorite by entityType + entityId
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: "entityType and entityId are required" },
        { status: 400 },
      );
    }

    const foreignKeyMap: Record<string, string> = {
      LOTISSEMENT: "lotissementId",
      PARCELLE: "parcelleId",
      BATIMENT: "batimentId",
    };
    const foreignKey = foreignKeyMap[entityType];

    if (!foreignKey) {
      return NextResponse.json(
        { error: "Invalid entityType" },
        { status: 400 },
      );
    }

    // Find and delete
    const favorite = await prisma.favorite.findFirst({
      where: {
        userId: session.user.id,
        entityType: entityType as any,
        [foreignKey]: parseInt(entityId),
      },
    });

    if (!favorite) {
      return NextResponse.json(
        { error: "Favorite not found" },
        { status: 404 },
      );
    }

    await prisma.favorite.delete({
      where: { id: favorite.id },
    });

    // Decrement favoriteCount on the entity
    const modelMap: Record<string, any> = {
      LOTISSEMENT: prisma.lotissement,
      PARCELLE: prisma.parcelle,
      BATIMENT: prisma.batiment,
    };
    const primaryKeyMap: Record<string, string> = {
      LOTISSEMENT: "Id_Lotis",
      PARCELLE: "Id_Parcel",
      BATIMENT: "Id_Bat",
    };

    await modelMap[entityType].update({
      where: { [primaryKeyMap[entityType]]: parseInt(entityId) },
      data: { favoriteCount: { decrement: 1 } },
    });

    return NextResponse.json({
      success: true,
      message: "Removed from favorites",
    });
  } catch (error) {
    console.error("[API] DELETE favorite error:", error);
    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 },
    );
  }
}
