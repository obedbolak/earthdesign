// app/api/upload/video-proxy/route.ts
import { NextRequest, NextResponse } from "next/server";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "100mb",
    },
  },
};

export const maxDuration = 60;

interface CloudinaryVideoUploadResponse {
  secure_url: string;
  public_id: string;
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
        { status: 400 },
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
        {
          error: "Only video files (MP4, MOV, AVI, WebM) are allowed",
          received: file.type,
        },
        { status: 400 },
      );
    }

    // Validate file size
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Video file size must be less than 100MB" },
        { status: 400 },
      );
    }

    // Convert file to Cloudinary FormData
    const cloudinaryFormData = new FormData();
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });

    cloudinaryFormData.append("file", blob, file.name);
    cloudinaryFormData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
    );
    cloudinaryFormData.append("folder", "earthdesign");
    cloudinaryFormData.append("resource_type", "video");

    // Upload directly to Cloudinary
    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`,
      {
        method: "POST",
        body: cloudinaryFormData,
      },
    );

    if (!cloudinaryResponse.ok) {
      const errorData = await cloudinaryResponse.json();
      console.error("Cloudinary error:", errorData);
      throw new Error(
        errorData.error?.message || "Upload to Cloudinary failed",
      );
    }

    const result: CloudinaryVideoUploadResponse =
      await cloudinaryResponse.json();

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    });
  } catch (error) {
    console.error("Video upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload video",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
