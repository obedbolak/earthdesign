// app/api/upload/video-finalize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { chunkStorage } from "@/lib/chunk-storage";

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
    const { sessionId, fileName, totalChunks } = await request.json();

    if (!sessionId || !fileName || totalChunks === undefined) {
      return NextResponse.json(
        { error: "Missing finalization parameters" },
        { status: 400 },
      );
    }

    // Check if session exists in storage
    if (!chunkStorage[sessionId]) {
      return NextResponse.json(
        { error: "Upload session not found" },
        { status: 400 },
      );
    }

    const sessionChunks = chunkStorage[sessionId];

    // Verify all chunks are present
    for (let i = 0; i < totalChunks; i++) {
      if (!sessionChunks[i]) {
        return NextResponse.json(
          { error: `Missing chunk ${i}` },
          { status: 400 },
        );
      }
    }

    // Reassemble chunks into single buffer
    const chunks: Uint8Array[] = [];
    for (let i = 0; i < totalChunks; i++) {
      chunks.push(sessionChunks[i]);
    }

    const fileBuffer = Buffer.concat(chunks.map((c) => Buffer.from(c)));

    // Upload to Cloudinary
    const uploadFormData = new FormData();
    uploadFormData.append("file", new Blob([fileBuffer]), fileName);
    uploadFormData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
    );
    uploadFormData.append("folder", "earthdesign");
    uploadFormData.append("resource_type", "video");

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`,
      {
        method: "POST",
        body: uploadFormData,
      },
    );

    if (!cloudinaryResponse.ok) {
      const errorData = await cloudinaryResponse.json();
      throw new Error(errorData.error?.message || "Cloudinary upload failed");
    }

    const result: CloudinaryVideoUploadResponse =
      await cloudinaryResponse.json();

    // Clean up temporary storage
    delete chunkStorage[sessionId];

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

    return NextResponse.json(videoData);
  } catch (error) {
    console.error("Video finalization error:", error);
    return NextResponse.json(
      {
        error: "Failed to finalize video upload",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export { chunkStorage };
