// lib/emailjs.ts

interface SendOTPEmailOptions {
  to: string;
  name?: string;
  otp: string;
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function formatExpiryTime(minutes: number = 10): string {
  const expiryDate = new Date(Date.now() + minutes * 60 * 1000);

  return expiryDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });
}

export async function sendOTPEmail({
  to,
  name,
  otp,
}: SendOTPEmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.error("EmailJS configuration missing");
      return { success: false, error: "Email service not configured" };
    }

    const expiryTime = formatExpiryTime(10); // 10 minutes

    const templateParams = {
      to_email: to,
      to_name: name || "User",
      passcode: otp,
      expiry_time: expiryTime,
    };

    const requestBody: Record<string, unknown> = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: templateParams,
    };

    // Add private key if available (for server-side sending)
    if (privateKey) {
      requestBody.accessToken = privateKey;
    }

    const response = await fetch(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("EmailJS error:", errorText);
      return { success: false, error: `Email failed: ${errorText}` };
    }

    console.log(`OTP email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

// For password reset emails
export async function sendPasswordResetEmail({
  to,
  name,
  otp,
}: SendOTPEmailOptions): Promise<{ success: boolean; error?: string }> {
  // You can create a different template for password reset
  // or use the same one
  return sendOTPEmail({ to, name, otp });
}
