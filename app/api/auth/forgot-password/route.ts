// app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createAndSendOTP } from "@/lib/otp";

export async function POST(request: Request) {
  console.log("=== FORGOT PASSWORD START ===");

  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    console.log("Checking if user exists:", email);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // For security, always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      console.log("User not found, but returning success for security");
      return NextResponse.json({
        message: "If an account exists, a reset code has been sent",
      });
    }

    console.log("User found, sending password reset OTP");

    // Send password reset OTP
    const otpResult = await createAndSendOTP(
      email,
      "PASSWORD_RESET",
      user.name || "User"
    );

    if (!otpResult.success) {
      console.error("Failed to send OTP:", otpResult.error);
      return NextResponse.json(
        { error: otpResult.error || "Failed to send reset code" },
        { status: 500 }
      );
    }

    console.log("=== FORGOT PASSWORD SUCCESS ===");
    return NextResponse.json({
      message: "Reset code sent to your email",
    });
  } catch (error) {
    console.error("=== FORGOT PASSWORD ERROR ===");
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
