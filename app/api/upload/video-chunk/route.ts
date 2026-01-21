// app/api/upload/video-chunk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { chunkStorage } from "@/lib/chunk-storage";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const chunk = formData.get("chunk") as File | null;
    const chunkIndex = formData.get("chunkIndex") as string;
    const totalChunks = formData.get("totalChunks") as string;
    const sessionId = formData.get("sessionId") as string;

    if (!chunk || !chunkIndex || !totalChunks || !sessionId) {
      return NextResponse.json(
        { error: "Missing chunk upload parameters" },
        { status: 400 },
      );
    }

    // Initialize session storage if needed
    if (!chunkStorage[sessionId]) {
      chunkStorage[sessionId] = {};
    }

    // Convert chunk to buffer and store
    const arrayBuffer = await chunk.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    chunkStorage[sessionId][parseInt(chunkIndex)] = buffer;

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
