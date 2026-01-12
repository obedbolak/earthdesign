// app/api/debug/route.ts
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check database connection
    const userCount = await prisma.user.count();

    // Check session
    const session = await auth();

    // Check env
    const hasSecret = !!process.env.AUTH_SECRET;

    return NextResponse.json({
      database: {
        connected: true,
        userCount,
      },
      session: session ?? "No session",
      env: {
        hasAuthSecret: hasSecret,
        nodeEnv: process.env.NODE_ENV,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
