// lib/auth.ts
import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { Adapter } from "next-auth/adapters";
import { UserRole } from "@prisma/client";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      role: UserRole;
      phone: string | null;
      agencyName: string | null;
      agencyLogo: string | null;
      bio: string | null;
      whatsapp: string | null;
      isVerified: boolean;
      emailVerified: Date | null;
    };
  }

  interface User {
    role: UserRole;
    phone: string | null;
    agencyName: string | null;
    agencyLogo: string | null;
    bio: string | null;
    whatsapp: string | null;
    isVerified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    email: string;
    name: string | null;
    image: string | null;
    phone: string | null;
    agencyName: string | null;
    agencyLogo: string | null;
    bio: string | null;
    whatsapp: string | null;
    isVerified: boolean;
    emailVerified: Date | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔐 Authorize attempt for:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            emailVerified: true,
            image: true,
            role: true,
            phone: true,
            agencyName: true,
            agencyLogo: true,
            bio: true,
            whatsapp: true,
            isVerified: true,
          },
        });

        if (!user?.password) {
          console.log("❌ User not found or no password");
          return null;
        }

        if (!user.emailVerified) {
          console.log("❌ Email not verified");
          throw new Error("Please verify your email before signing in");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isValid) {
          console.log("❌ Invalid password");
          return null;
        }

        console.log("✅ User authorized:", user.id);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          phone: user.phone,
          agencyName: user.agencyName,
          agencyLogo: user.agencyLogo,
          bio: user.bio,
          whatsapp: user.whatsapp,
          isVerified: user.isVerified,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.sub = user.id; // 🔧 Also set sub for consistency
        token.role = user.role;
        token.email = user.email!;
        token.name = user.name ?? null;
        token.image = user.image ?? null;
        token.phone = user.phone ?? null;
        token.agencyName = user.agencyName ?? null;
        token.agencyLogo = user.agencyLogo ?? null;
        token.bio = user.bio ?? null;
        token.whatsapp = user.whatsapp ?? null;
        token.isVerified = user.isVerified ?? false;
        token.emailVerified = user.emailVerified ?? null;
      }

      // 🔧 FIX: Ensure id is always set (handles old sessions)
      if (!token.id && token.sub) {
        token.id = token.sub;
      }

      // 🔧 FIX: If somehow we have email but no id, try to fetch from DB
      if (!token.id && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { id: true, role: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.sub = dbUser.id;
          token.role = dbUser.role;
        }
      }

      // Handle session updates
      if (trigger === "update" && session) {
        // ... your existing update code ...
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        // 🔧 FIX: Use fallback chain for id
        session.user.id = (token.id || token.sub) as string;
        session.user.role = token.role as UserRole;
        session.user.email = token.email as string;
        session.user.name = token.name as string | null;
        session.user.image = token.image as string | null;
        session.user.phone = token.phone ?? null;
        session.user.agencyName = token.agencyName ?? null;
        session.user.agencyLogo = token.agencyLogo ?? null;
        session.user.bio = token.bio ?? null;
        session.user.whatsapp = token.whatsapp ?? null;
        session.user.isVerified = token.isVerified ?? false;
        session.user.emailVerified = token.emailVerified ?? null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// Helper function to get session on server
export const auth = () => getServerSession(authOptions);

// Helper function to check if user is admin
export const isAdmin = async () => {
  const session = await auth();
  return session?.user?.role === "ADMIN";
};

// Helper function to check if user is agent or admin
export const isAgentOrAdmin = async () => {
  const session = await auth();
  return session?.user?.role === "AGENT" || session?.user?.role === "ADMIN";
};

// Helper function to require authentication
export const requireAuth = async () => {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
};

// Helper function to require admin role
export const requireAdmin = async () => {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") {
    throw new Error("Forbidden - Admin access required");
  }
  return session;
};

// Helper function to require agent or admin role
export const requireAgentOrAdmin = async () => {
  const session = await requireAuth();
  if (session.user.role !== "AGENT" && session.user.role !== "ADMIN") {
    throw new Error("Forbidden - Agent or Admin access required");
  }
  return session;
};
