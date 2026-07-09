// app/api/auth/verify-reset-otp/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  console.log("=== VERIFY RESET OTP START ===");

  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    console.log("Verifying reset OTP for:", email);

    // Verify OTP EXISTS but DON'T delete it yet
    // We need it for the password reset step
    const otpRecord = await prisma.oTPToken.findFirst({
      where: {
        email,
        token: otp,
        type: "PASSWORD_RESET",
        expires: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      console.log("OTP verification failed: not found or expired");
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 400 }
      );
    }

    console.log("=== VERIFY RESET OTP SUCCESS ===");
    console.log("OTP valid, keeping it for password reset step");

    return NextResponse.json({
      message: "Code verified successfully",
    });
  } catch (error) {
    console.error("=== VERIFY RESET OTP ERROR ===");
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
