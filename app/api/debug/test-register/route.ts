// app/api/debug/test-register/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  console.log("=== TEST 1: Route hit ===");

  try {
    // Test 1: Parse body
    const body = await request.json();
    console.log("=== TEST 2: Body parsed ===", body);

    // Test 2: Import Prisma
    const { default: prisma } = await import("@/lib/prisma");
    console.log("=== TEST 3: Prisma imported ===");

    // Test 3: Check database connection
    const userCount = await prisma.user.count();
    console.log("=== TEST 4: DB connected, users:", userCount, "===");

    // Test 4: Check OTPToken table exists
    const otpCount = await prisma.oTPToken.count();
    console.log("=== TEST 5: OTPToken table exists, count:", otpCount, "===");

    // Test 5: Import bcrypt
    const bcrypt = await import("bcryptjs");
    const hash = await bcrypt.hash("test", 12);
    console.log("=== TEST 6: Bcrypt works ===");

    // Test 6: Import OTP function
    const { createAndSendOTP } = await import("@/lib/otp");
    console.log("=== TEST 7: OTP module imported ===");

    return NextResponse.json({
      success: true,
      tests: "All passed",
      userCount,
      otpCount,
    });
  } catch (error) {
    console.error("=== TEST FAILED ===");
    console.error("Error:", error);
    console.error(
      "Message:",
      error instanceof Error ? error.message : String(error),
    );
    console.error("Stack:", error instanceof Error ? error.stack : "No stack");

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
