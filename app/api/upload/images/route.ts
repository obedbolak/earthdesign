// app/api/upload/images/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with API credentials (server-side only)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryResource {
  asset_id: string;
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  created_at: string;
  bytes: number;
}

// GET - List all images from your folder
export async function GET() {
  try {
    // This requires API Key + Secret
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "earthdesign", // Your folder name from preset
      max_results: 100,
      resource_type: "image",
    });

    const images = result.resources.map((resource: CloudinaryResource) => ({
      id: resource.asset_id,
      url: resource.secure_url,
      publicId: resource.public_id,
      width: resource.width,
      height: resource.height,
      format: resource.format,
      createdAt: resource.created_at,
      size: resource.bytes,
    }));

    return NextResponse.json({
      success: true,
      images,
      total: images.length,
    });
  } catch (error) {
    console.error("Fetch images error:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}

// POST - Upload images (uses unsigned preset - no API key needed for upload itself)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length < 1 || files.length > 6) {
      return NextResponse.json(
        { error: "Please upload between 1 and 6 images" },
        { status: 400 }
      );
    }

    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    const invalidFiles = files.filter(
      (file) => !validImageTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      return NextResponse.json(
        { error: "Only image files (JPEG, PNG, WebP, GIF) are allowed" },
        { status: 400 }
      );
    }

    // Upload using unsigned preset (doesn't need API key)
    const uploadPromises = files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadFormData = new FormData();
      uploadFormData.append("file", new Blob([buffer]), file.name);
      uploadFormData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      );

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: uploadFormData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error?.message || `Upload failed for ${file.name}`
        );
      }

      return response.json();
    });

    const results = await Promise.all(uploadPromises);

    const imageData = results.map((result) => ({
      id: result.asset_id,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    }));

    return NextResponse.json({
      success: true,
      images: imageData,
      count: imageData.length,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload images",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete image by public ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("publicId");

    if (!publicId) {
      return NextResponse.json(
        { error: "publicId query parameter is required" },
        { status: 400 }
      );
    }

    // This requires API Key + Secret
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    if (result.result !== "ok") {
      return NextResponse.json(
        { error: `Failed to delete image: ${result.result}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Image deleted" });
  } catch (error) {
    console.error("Image deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
