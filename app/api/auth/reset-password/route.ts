// app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  console.log("=== RESET PASSWORD START ===");

  try {
    const body = await request.json();
    const { email, otp, newPassword } = body;

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Email, OTP, and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    console.log("Verifying OTP for password reset:", email);

    // Verify OTP one more time
    const otpRecord = await prisma.oTPToken.findFirst({
      where: {
        email,
        token: otp,
        type: "PASSWORD_RESET",
        expires: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      console.log("Invalid or expired OTP");
      return NextResponse.json(
        { error: "Invalid or expired reset code" },
        { status: 400 }
      );
    }

    console.log("OTP verified, updating password");

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Delete the OTP token
    await prisma.oTPToken.delete({
      where: { id: otpRecord.id },
    });

    // Delete all other OTP tokens for this email
    await prisma.oTPToken.deleteMany({
      where: { email },
    });

    console.log("=== RESET PASSWORD SUCCESS ===");
    return NextResponse.json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("=== RESET PASSWORD ERROR ===");
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
