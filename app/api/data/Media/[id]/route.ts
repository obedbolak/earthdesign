// app/api/data/Media/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { canManageEntityMedia, getRequestUser } from "@/lib/mobile-auth";

async function canManageMedia(request: NextRequest, id: number) {
  const user = await getRequestUser(request);
  if (!user) return { allowed: false, status: 401, error: "Authentication required" };

  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return { allowed: false, status: 404, error: "Media not found" };

  const entityId =
    media.lotissementId ?? media.parcelleId ?? media.batimentId ?? media.infrastructureId;
  if (!entityId || !(await canManageEntityMedia(user, media.entityType, entityId))) {
    return { allowed: false, status: 403, error: "You can only modify media on your own listings" };
  }

  return { allowed: true, media };
}

// GET single media
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    return NextResponse.json({ data: media });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 },
    );
  }
}

// DELETE media
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const authorization = await canManageMedia(request, id);
    if (!authorization.allowed) {
      return NextResponse.json({ error: authorization.error }, { status: authorization.status });
    }

    await prisma.media.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 },
    );
  }
}

// PATCH update media
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const authorization = await canManageMedia(request, id);
    if (!authorization.allowed) {
      return NextResponse.json({ error: authorization.error }, { status: authorization.status });
    }

    const body = await request.json();
    const { order, url, type } = body;

    const updateData: Record<string, any> = {};
    if (order !== undefined) updateData.order = parseInt(order);
    if (url !== undefined) updateData.url = url;
    if (type !== undefined) updateData.type = type;

    const media = await prisma.media.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: media });
  } catch (error) {
    console.error("Error updating media:", error);
    return NextResponse.json(
      { error: "Failed to update media" },
      { status: 500 },
    );
  }
}
