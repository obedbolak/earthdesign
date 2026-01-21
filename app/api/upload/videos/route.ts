// app/api/upload/videos/route.ts
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
  duration: number;
  format: string;
  created_at: string;
  bytes: number;
}

// GET - List all videos from your folder
export async function GET() {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "earthdesign",
      max_results: 100,
      resource_type: "video",
    });

    const videos = result.resources.map((resource: CloudinaryResource) => ({
      id: resource.asset_id,
      url: resource.secure_url,
      publicId: resource.public_id,
      width: resource.width || 0,
      height: resource.height || 0,
      duration: resource.duration || 0,
      format: resource.format,
      createdAt: resource.created_at,
      bytes: resource.bytes,
    }));

    return NextResponse.json({
      success: true,
      videos,
      total: videos.length,
    });
  } catch (error) {
    console.error("Fetch videos error:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 },
    );
  }
}

// DELETE - Delete video by public ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("publicId");

    if (!publicId) {
      return NextResponse.json(
        { error: "publicId query parameter is required" },
        { status: 400 },
      );
    }

    // This requires API Key + Secret
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });

    if (result.result !== "ok") {
      return NextResponse.json(
        { error: `Failed to delete video: ${result.result}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, message: "Video deleted" });
  } catch (error) {
    console.error("Video deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 },
    );
  }
}
