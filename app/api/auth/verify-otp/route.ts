// app/api/auth/verify-otp/route.ts
import { NextResponse } from "next/server";
import { verifyOTP } from "@/lib/otp";
import { OTPType } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const { email, otp, type = "EMAIL_VERIFICATION" } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and verification code are required" },
        { status: 400 }
      );
    }

    const result = await verifyOTP(email, otp, type as OTPType);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
