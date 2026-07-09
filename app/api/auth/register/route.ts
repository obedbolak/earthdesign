// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createAndSendOTP } from "@/lib/otp";

export async function POST(request: Request) {
  console.log("=== REGISTER API START ===");

  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log("1. Body parsed:", {
        email: body.email,
        hasPassword: !!body.password,
        name: body.name,
      });
    } catch (parseError) {
      console.error("Body parse error:", parseError);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { email, password, name } = body;

    // Validation
    if (!email || !password) {
      console.log("2. Validation failed: missing email or password");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      console.log("2. Validation failed: password too short");
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    console.log("2. Validation passed");

    // Check existing user
    let existingUser;
    try {
      console.log("3. Checking for existing user...");
      existingUser = await prisma.user.findUnique({
        where: { email },
      });
      console.log("3. Existing user:", existingUser ? "Found" : "Not found");
    } catch (dbError) {
      console.error("3. Database error checking user:", dbError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (existingUser) {
      if (!existingUser.emailVerified) {
        console.log("4. User exists but not verified, resending OTP...");

        const displayName = name?.trim() || existingUser.name || "User";

        try {
          const otpResult = await createAndSendOTP(
            email,
            "EMAIL_VERIFICATION",
            displayName
          );
          console.log("4. OTP result:", otpResult);

          if (!otpResult.success) {
            return NextResponse.json(
              { error: otpResult.error || "Failed to send verification code" },
              { status: 500 }
            );
          }

          return NextResponse.json({
            message: "Verification code sent",
            requiresVerification: true,
            email,
          });
        } catch (otpError) {
          console.error("4. OTP error:", otpError);
          return NextResponse.json(
            { error: "Failed to send verification code" },
            { status: 500 }
          );
        }
      }

      console.log("4. User already exists and verified");
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Create new user
    let user;
    try {
      console.log("5. Hashing password...");
      const hashedPassword = await bcrypt.hash(password, 12);
      console.log("5. Password hashed");

      console.log("6. Creating user in database...");
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name?.trim() || null,
          role: "USER",
          emailVerified: null,
        },
      });
      console.log("6. User created:", user.id);
    } catch (createError) {
      console.error("6. User creation error:", createError);
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      );
    }

    // Send OTP
    try {
      console.log("7. Sending OTP...");
      const displayName = name?.trim() || "User";

      const otpResult = await createAndSendOTP(
        email,
        "EMAIL_VERIFICATION",
        displayName
      );
      console.log("7. OTP result:", otpResult);

      if (!otpResult.success) {
        console.log("7. OTP failed, deleting user...");
        await prisma.user.delete({ where: { id: user.id } });
        return NextResponse.json(
          { error: otpResult.error || "Failed to send verification code" },
          { status: 500 }
        );
      }
    } catch (otpError) {
      console.error("7. OTP error:", otpError);
      // Try to delete user
      try {
        await prisma.user.delete({ where: { id: user.id } });
      } catch (deleteError) {
        console.error("7. Failed to delete user after OTP error:", deleteError);
      }
      return NextResponse.json(
        { error: "Failed to send verification code" },
        { status: 500 }
      );
    }

    console.log("=== REGISTER SUCCESS ===");
    return NextResponse.json(
      {
        message: "Account created. Please verify your email.",
        requiresVerification: true,
        email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("=== REGISTER UNEXPECTED ERROR ===");
    console.error("Error:", error);
    console.error("Stack:", error instanceof Error ? error.stack : "No stack");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
