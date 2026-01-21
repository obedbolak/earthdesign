// app/api/upload/video-chunk/route.ts
// This route is deprecated - chunked uploads now use Cloudinary's native API directly
// Kept for backward compatibility if needed

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error:
        "This endpoint is deprecated. Use Cloudinary's native chunked upload instead.",
      message: "Chunks are now uploaded directly to Cloudinary API",
    },
    { status: 410 },
  );
}
