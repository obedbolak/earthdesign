import { getToken, encode } from "next-auth/jwt";
import type { UserRole } from "@prisma/client";
import prisma from "@/lib/prisma";

const MOBILE_TOKEN_MAX_AGE = 30 * 24 * 60 * 60;

export type MobileAuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  image: string | null;
  phone: string | null;
  agencyName: string | null;
  agencyLogo: string | null;
  bio: string | null;
  whatsapp: string | null;
  isVerified: boolean;
};

function getAuthSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET must be configured");
  }
  return secret;
}

/**
 * Creates a NextAuth-compatible bearer token for the native app. It can be
 * verified by getToken() without giving the mobile app database access.
 */
export async function createMobileAccessToken(user: MobileAuthUser) {
  return encode({
    secret: getAuthSecret(),
    maxAge: MOBILE_TOKEN_MAX_AGE,
    token: {
      sub: user.id,
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
      emailVerified: null,
    },
  });
}

/** Returns the current user for either a web session cookie or mobile bearer token. */
export async function getRequestUser(request: Request) {
  const token = await getToken({
    req: request as Parameters<typeof getToken>[0]["req"],
    secret: getAuthSecret(),
  });

  const userId = token?.id || token?.sub;
  if (!userId || typeof userId !== "string") return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
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
}

export function canCreateListings(role: UserRole) {
  return role === "AGENT" || role === "ADMIN";
}

export async function canManageEntityMedia(
  user: { id: string; role: UserRole },
  entityType: string,
  entityId: number,
) {
  if (user.role === "ADMIN") return true;
  if (user.role !== "AGENT") return false;

  const owner =
    entityType === "LOTISSEMENT"
      ? await prisma.lotissement.findUnique({
          where: { Id_Lotis: entityId },
          select: { createdById: true },
        })
      : entityType === "PARCELLE"
        ? await prisma.parcelle.findUnique({
            where: { Id_Parcel: entityId },
            select: { createdById: true },
          })
        : entityType === "BATIMENT"
          ? await prisma.batiment.findUnique({
              where: { Id_Bat: entityId },
              select: { createdById: true },
            })
          : null;

  return owner?.createdById === user.id;
}
