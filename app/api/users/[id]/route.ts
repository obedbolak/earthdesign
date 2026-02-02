// app/api/users/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 },
      );
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        image: true,
        phone: true,
        // Agent-specific fields
        agencyName: true,
        agencyLogo: true,
        bio: true,
        whatsapp: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            lotissements: true,
            parcelles: true,
            batiments: true,
            favorites: true,
            shares: true,
            views: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Allowed fields for update
    const {
      name,
      role,
      phone,
      agencyName,
      agencyLogo,
      bio,
      whatsapp,
      isVerified,
      emailVerified,
    } = body;

    // Validate role
    if (role && !["USER", "AGENT", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Prevent admin from demoting themselves
    if (session.user.id === id && role && role !== "ADMIN") {
      return NextResponse.json(
        { error: "You cannot change your own admin role" },
        { status: 400 },
      );
    }

    // Build update data object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (phone !== undefined) updateData.phone = phone;
    if (agencyName !== undefined) updateData.agencyName = agencyName;
    if (agencyLogo !== undefined) updateData.agencyLogo = agencyLogo;
    if (bio !== undefined) updateData.bio = bio;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (emailVerified !== undefined) {
      updateData.emailVerified = emailVerified ? new Date(emailVerified) : null;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        image: true,
        phone: true,
        agencyName: true,
        agencyLogo: true,
        bio: true,
        whatsapp: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 },
      );
    }

    const { id } = await params;

    // Prevent admin from deleting themselves
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 },
      );
    }

    // Delete user (cascading deletes will handle related records per schema)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
