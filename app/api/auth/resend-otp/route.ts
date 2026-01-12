// app/api/auth/resend-otp/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createAndSendOTP } from "@/lib/otp";
import { OTPType } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const { email, type = "EMAIL_VERIFICATION" } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({
        message: "If an account exists, a verification code has been sent",
      });
    }

    // Rate limiting
    const lastOTP = await prisma.oTPToken.findFirst({
      where: { email, type: type as OTPType },
      orderBy: { createdAt: "desc" },
    });

    if (lastOTP) {
      const timeSinceLastOTP = Date.now() - lastOTP.createdAt.getTime();
      const minWaitTime = 60 * 1000;

      if (timeSinceLastOTP < minWaitTime) {
        const waitSeconds = Math.ceil((minWaitTime - timeSinceLastOTP) / 1000);
        return NextResponse.json(
          {
            error: `Please wait ${waitSeconds} seconds before requesting a new code`,
          },
          { status: 429 }
        );
      }
    }

    const result = await createAndSendOTP(
      email,
      type as OTPType,
      user.name || undefined
    );

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send verification code" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Verification code sent" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      { error: "Failed to resend verification code" },
      { status: 500 }
    );
  }
}
