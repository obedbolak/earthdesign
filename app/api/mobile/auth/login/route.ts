import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { createMobileAccessToken } from "@/lib/mobile-auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        emailVerified: true,
        role: true,
        image: true,
        phone: true,
        agencyName: true,
        agencyLogo: true,
        bio: true,
        whatsapp: true,
        isVerified: true,
      },
    });

    if (!user?.password || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before signing in" },
        { status: 403 },
      );
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.image,
      phone: user.phone,
      agencyName: user.agencyName,
      agencyLogo: user.agencyLogo,
      bio: user.bio,
      whatsapp: user.whatsapp,
      isVerified: user.isVerified,
    };
    const accessToken = await createMobileAccessToken(safeUser);

    return NextResponse.json({
      accessToken,
      user: safeUser,
    });
  } catch (error) {
    console.error("[Mobile auth] Login error:", error);
    return NextResponse.json({ error: "Unable to sign in" }, { status: 500 });
  }
}
