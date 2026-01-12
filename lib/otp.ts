// lib/otp.ts
import prisma from "@/lib/prisma";
import { generateOTP, sendOTPEmail } from "@/lib/emailjs";

export type OTPType =
  | "EMAIL_VERIFICATION"
  | "PASSWORD_RESET"
  | "LOGIN_VERIFICATION";

const OTP_EXPIRY_MINUTES = 10;

export async function createAndSendOTP(
  email: string,
  type: OTPType,
  name?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete any existing OTPs for this email and type
    await prisma.oTPToken.deleteMany({
      where: { email, type },
    });

    // Generate new OTP
    const otp = generateOTP();
    const expires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Save OTP to database
    await prisma.oTPToken.create({
      data: {
        email,
        token: otp,
        type,
        expires,
      },
    });

    // Send email via EmailJS
    const emailResult = await sendOTPEmail({
      to: email,
      name,
      otp,
    });

    if (!emailResult.success) {
      // Delete OTP if email failed
      await prisma.oTPToken.deleteMany({
        where: { email, type },
      });
      console.error("Failed to send OTP email:", emailResult.error);
      return {
        success: false,
        error: emailResult.error || "Failed to send verification code",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("OTP creation error:", error);
    return { success: false, error: "Failed to send verification code" };
  }
}

export async function verifyOTP(
  email: string,
  token: string,
  type: OTPType
): Promise<{ success: boolean; error?: string }> {
  try {
    const otpRecord = await prisma.oTPToken.findFirst({
      where: {
        email,
        token,
        type,
        expires: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      return { success: false, error: "Invalid or expired verification code" };
    }

    // Delete the used OTP
    await prisma.oTPToken.delete({
      where: { id: otpRecord.id },
    });

    // If email verification, update user
    if (type === "EMAIL_VERIFICATION") {
      await prisma.user.update({
        where: { email },
        data: { emailVerified: new Date() },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("OTP verification error:", error);
    return { success: false, error: "Verification failed" };
  }
}

export async function cleanupExpiredOTPs(): Promise<number> {
  const result = await prisma.oTPToken.deleteMany({
    where: { expires: { lt: new Date() } },
  });
  return result.count;
}
