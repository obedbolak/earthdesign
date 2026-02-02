// app/api/upload/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST - Upload profile image
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const imageType = formData.get("type") as string; // "profile" or "agencyLogo"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!validImageTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only image files (JPEG, PNG, WebP) are allowed" },
        { status: 400 },
      );
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 },
      );
    }

    // Get current user to delete old image
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        image: true,
        agencyLogo: true,
        role: true,
      },
    });

    // Delete old image from Cloudinary if it exists
    const oldImageUrl =
      imageType === "agencyLogo" ? user?.agencyLogo : user?.image;
    if (oldImageUrl && oldImageUrl.includes("cloudinary.com")) {
      try {
        // Extract public_id from URL
        const urlParts = oldImageUrl.split("/");
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExt.split(".")[0];
        const folder = urlParts[urlParts.length - 2];
        const fullPublicId = `${folder}/${publicId}`;

        await cloudinary.uploader.destroy(fullPublicId, {
          resource_type: "image",
        });
      } catch (error) {
        console.error("Failed to delete old image:", error);
        // Continue anyway - don't fail the upload
      }
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine folder based on type
    const folder =
      imageType === "agencyLogo"
        ? "earthdesign/agency-logos"
        : "earthdesign/profiles";

    // Upload using unsigned preset
    const uploadFormData = new FormData();
    uploadFormData.append("file", new Blob([buffer]), file.name);
    uploadFormData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
    );
    uploadFormData.append("folder", folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: uploadFormData,
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Upload failed");
    }

    const result = await response.json();

    // Update user in database
    const updateData =
      imageType === "agencyLogo"
        ? { agencyLogo: result.secure_url }
        : { image: result.secure_url };

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        image: true,
        agencyLogo: true,
      },
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile image upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload profile image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// DELETE - Delete profile image
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const imageType = searchParams.get("type") as string; // "profile" or "agencyLogo"

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        image: true,
        agencyLogo: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const imageUrl = imageType === "agencyLogo" ? user.agencyLogo : user.image;

    // Delete from Cloudinary if it's a Cloudinary URL
    if (imageUrl && imageUrl.includes("cloudinary.com")) {
      try {
        // Extract public_id from URL
        const urlParts = imageUrl.split("/");
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExt.split(".")[0];
        const folder = urlParts[urlParts.length - 2];
        const fullPublicId = `${folder}/${publicId}`;

        await cloudinary.uploader.destroy(fullPublicId, {
          resource_type: "image",
        });
      } catch (error) {
        console.error("Failed to delete from Cloudinary:", error);
        // Continue anyway
      }
    }

    // Update user in database (set to null)
    const updateData =
      imageType === "agencyLogo" ? { agencyLogo: null } : { image: null };

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        image: true,
        agencyLogo: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Image deleted",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile image deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete profile image" },
      { status: 500 },
    );
  }
}
