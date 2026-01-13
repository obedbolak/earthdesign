// app/api/auth/resend-otp/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createAndSendOTP, type OTPType } from "@/lib/otp";

// Rate limiting: track last send time per email
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 60000; // 1 minute

export async function POST(request: Request) {
  console.log("=== RESEND OTP START ===");

  try {
    const body = await request.json();
    const { email, type = "EMAIL_VERIFICATION" } = body as {
      email: string;
      type?: OTPType;
    };

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    console.log(`Resending OTP to ${email} for type: ${type}`);

    // Rate limiting check
    const lastSendTime = rateLimitMap.get(email);
    if (lastSendTime && Date.now() - lastSendTime < RATE_LIMIT_MS) {
      const waitTime = Math.ceil(
        (RATE_LIMIT_MS - (Date.now() - lastSendTime)) / 1000
      );
      return NextResponse.json(
        {
          error: `Please wait ${waitTime} seconds before requesting another code`,
        },
        { status: 429 }
      );
    }

    // Get user for name
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security, don't reveal if user exists
      if (type === "PASSWORD_RESET") {
        return NextResponse.json({
          message: "If an account exists, a code has been sent",
        });
      }
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user needs verification (for EMAIL_VERIFICATION type)
    if (type === "EMAIL_VERIFICATION" && user.emailVerified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 }
      );
    }

    // Send OTP
    const otpResult = await createAndSendOTP(email, type, user.name || "User");

    if (!otpResult.success) {
      console.error("Failed to send OTP:", otpResult.error);
      return NextResponse.json(
        { error: otpResult.error || "Failed to send verification code" },
        { status: 500 }
      );
    }

    // Update rate limit
    rateLimitMap.set(email, Date.now());

    console.log("=== RESEND OTP SUCCESS ===");
    return NextResponse.json({
      message: "Verification code sent",
    });
  } catch (error) {
    console.error("=== RESEND OTP ERROR ===");
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
