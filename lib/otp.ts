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
    console.log(
      `Creating OTP for ${email}, type: ${type}, name: ${name || "User"}`
    );

    // Delete any existing OTPs for this email and type
    const deleted = await prisma.oTPToken.deleteMany({
      where: { email, type },
    });
    console.log(`Deleted ${deleted.count} existing OTP(s)`);

    // Generate new OTP
    const otp = generateOTP();
    const expires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    console.log(`Generated OTP: ${otp}, expires: ${expires.toISOString()}`);

    // Save OTP to database
    const otpRecord = await prisma.oTPToken.create({
      data: {
        email,
        token: otp,
        type,
        expires,
      },
    });
    console.log(`OTP saved to database with ID: ${otpRecord.id}`);

    // Send email via EmailJS
    // Ensure name is never undefined/empty
    const displayName = name && name.trim() ? name.trim() : "User";
    console.log(`Sending email to ${email} with name: ${displayName}`);

    const emailResult = await sendOTPEmail({
      to: email,
      name: displayName,
      otp,
    });

    if (!emailResult.success) {
      console.error("Email sending failed:", emailResult.error);
      // Clean up the OTP record if email fails
      await prisma.oTPToken.deleteMany({
        where: { email, type },
      });
      return {
        success: false,
        error: emailResult.error || "Failed to send verification code",
      };
    }

    console.log(`✅ OTP created and sent successfully to ${email}`);
    return { success: true };
  } catch (error) {
    console.error("OTP creation error:", error);
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }
    return {
      success: false,
      error: "Failed to send verification code. Please try again.",
    };
  }
}

export async function verifyOTP(
  email: string,
  token: string,
  type: OTPType
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Verifying OTP for ${email}, type: ${type}`);

    const otpRecord = await prisma.oTPToken.findFirst({
      where: {
        email,
        token,
        type,
        expires: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      console.log(`No valid OTP found for ${email}`);
      return { success: false, error: "Invalid or expired verification code" };
    }

    console.log(`Valid OTP found, deleting token ID: ${otpRecord.id}`);

    // Delete the used OTP
    await prisma.oTPToken.delete({
      where: { id: otpRecord.id },
    });

    // Update user email verification if this is email verification
    if (type === "EMAIL_VERIFICATION") {
      console.log(`Updating emailVerified for ${email}`);
      await prisma.user.update({
        where: { email },
        data: { emailVerified: new Date() },
      });
      console.log(`✅ Email verified for ${email}`);
    }

    return { success: true };
  } catch (error) {
    console.error("OTP verification error:", error);
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }
    return { success: false, error: "Verification failed. Please try again." };
  }
}

export async function cleanupExpiredOTPs(): Promise<number> {
  try {
    const result = await prisma.oTPToken.deleteMany({
      where: { expires: { lt: new Date() } },
    });
    console.log(`Cleaned up ${result.count} expired OTP(s)`);
    return result.count;
  } catch (error) {
    console.error("Error cleaning up expired OTPs:", error);
    return 0;
  }
}
