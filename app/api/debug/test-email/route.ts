// You can test in a simple API route
// app/api/test-email/route.ts
import { NextResponse } from "next/server";
import { sendOTPEmail, generateOTP } from "@/lib/emailjs";

export async function GET() {
  const result = await sendOTPEmail({
    to: "bolakfuchuobed@gmail.com",
    name: "obeqed bolak",
    otp: generateOTP(),
  });

  return NextResponse.json(result);
}
