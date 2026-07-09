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

    if (!serviceId || !templateId || !publicKey || !privateKey) {
      console.error("EmailJS configuration missing:", {
        hasServiceId: !!serviceId,
        hasTemplateId: !!templateId,
        hasPublicKey: !!publicKey,
        hasPrivateKey: !!privateKey,
      });
      return { success: false, error: "Email service not configured" };
    }

    const expiryTime = formatExpiryTime(10);

    // Ensure all template params have valid values
    const templateParams = {
      to_email: to.trim(),
      to_name: name && name.trim() ? name.trim() : "User",
      passcode: otp,
      expiry_time: expiryTime,
    };

    console.log("Sending email with params:", {
      to: templateParams.to_email,
      name: templateParams.to_name,
      hasOtp: !!otp,
    });

    const response = await fetch(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          accessToken: privateKey,
          template_params: templateParams,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("EmailJS API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      return {
        success: false,
        error: `Email service error: ${response.status} - ${errorText}`,
      };
    }

    const responseData = await response.text();
    console.log(`✅ OTP sent successfully to ${to}`, responseData); // ✅ Fixed syntax error
    return { success: true };
  } catch (error) {
    console.error("Email sending error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}
