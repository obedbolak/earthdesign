// app/api/upload/video-finalize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { readFile, rm } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

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

const UPLOADS_DIR = join(process.cwd(), "tmp", "video-chunks");

export async function POST(request: NextRequest) {
  try {
    const { sessionId, fileName, totalChunks } = await request.json();

    if (!sessionId || !fileName || totalChunks === undefined) {
      return NextResponse.json(
        { error: "Missing finalization parameters" },
        { status: 400 },
      );
    }

    const sessionDir = join(UPLOADS_DIR, sessionId);

    // Check if session directory exists
    if (!existsSync(sessionDir)) {
      return NextResponse.json(
        { error: "Upload session not found" },
        { status: 400 },
      );
    }

    // Reassemble chunks into single buffer
    const chunks: Buffer[] = [];
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = join(sessionDir, `chunk-${i}`);

      if (!existsSync(chunkPath)) {
        throw new Error(`Missing chunk ${i}`);
      }

      const chunkBuffer = await readFile(chunkPath);
      chunks.push(chunkBuffer);
    }

    const fileBuffer = Buffer.concat(chunks);

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

    // Clean up temporary files
    try {
      await rm(sessionDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.warn("Failed to cleanup temporary files:", cleanupError);
    }

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
