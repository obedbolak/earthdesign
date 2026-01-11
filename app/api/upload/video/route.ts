// app/api/upload/video/route.ts
import { NextRequest, NextResponse } from "next/server";

interface CloudinaryVideoUploadResponse {
  secure_url: string;
  public_id: string;
  duration: number;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

interface UploadedVideoData {
  url: string;
  publicId: string;
  duration: number;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No video file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const validVideoTypes = [
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
    ];

    if (!validVideoTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only video files (MP4, MOV, AVI, WebM) are allowed" },
        { status: 400 }
      );
    }

    // Optional: Validate file size (e.g., max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Video file size must be less than 100MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Prepare upload to Cloudinary
    const uploadFormData = new FormData();
    uploadFormData.append("file", new Blob([buffer]), file.name);
    uploadFormData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );
    uploadFormData.append("folder", "earthdesign");
    uploadFormData.append("resource_type", "video");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`,
      {
        method: "POST",
        body: uploadFormData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Upload failed");
    }

    const result: CloudinaryVideoUploadResponse = await response.json();

    // Return video data
    const videoData: UploadedVideoData = {
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };

    return NextResponse.json({
      success: true,
      video: videoData,
    });
  } catch (error) {
    console.error("Video upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload video",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Configure for larger file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "100mb",
    },
  },
};
