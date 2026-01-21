// app/api/upload/video-chunk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
};

export const maxDuration = 60;

const UPLOADS_DIR = join(process.cwd(), "tmp", "video-chunks");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const chunk = formData.get("chunk") as File | null;
    const chunkIndex = formData.get("chunkIndex") as string;
    const totalChunks = formData.get("totalChunks") as string;
    const sessionId = formData.get("sessionId") as string;
    const fileName = formData.get("fileName") as string;

    if (!chunk || !chunkIndex || !totalChunks || !sessionId) {
      return NextResponse.json(
        { error: "Missing chunk upload parameters" },
        { status: 400 },
      );
    }

    // Create directory for this session's chunks
    const sessionDir = join(UPLOADS_DIR, sessionId);
    if (!existsSync(sessionDir)) {
      await mkdir(sessionDir, { recursive: true });
    }

    // Save chunk to temporary storage
    const chunkPath = join(sessionDir, `chunk-${chunkIndex}`);
    const arrayBuffer = await chunk.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await writeFile(chunkPath, buffer);

    return NextResponse.json({
      success: true,
      chunkIndex: parseInt(chunkIndex),
      totalChunks: parseInt(totalChunks),
      message: `Chunk ${parseInt(chunkIndex) + 1} of ${totalChunks} received`,
    });
  } catch (error) {
    console.error("Chunk upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload chunk",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
