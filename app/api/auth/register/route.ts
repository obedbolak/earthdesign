// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createAndSendOTP } from "@/lib/otp";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (!existingUser.emailVerified) {
        const otpResult = await createAndSendOTP(
          email,
          "EMAIL_VERIFICATION", // Use string directly
          name || existingUser.name || undefined
        );

        if (!otpResult.success) {
          return NextResponse.json(
            { error: "Failed to send verification code" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          message: "Verification code sent",
          requiresVerification: true,
          email,
        });
      }

      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: "USER",
        emailVerified: null,
      },
    });

    const otpResult = await createAndSendOTP(
      email,
      "EMAIL_VERIFICATION", // Use string directly
      name
    );

    if (!otpResult.success) {
      await prisma.user.delete({ where: { id: user.id } });
      return NextResponse.json(
        { error: "Failed to send verification code" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Account created. Please verify your email.",
        requiresVerification: true,
        email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
