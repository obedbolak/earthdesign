// lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { Adapter } from "next-auth/adapters";
import { UserRole } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,

  providers: [
    Credentials({
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
          where: { email: credentials.email as string },
        });

        if (!user?.password) {
          console.log("❌ User not found or no password");
          return null;
        }

        // Check if email is verified
        if (!user.emailVerified) {
          console.log("❌ Email not verified");
          throw new Error("Please verify your email before signing in");
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
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
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],

  // Use JWT sessions (required for Credentials provider)
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  callbacks: {
    // JWT callback - for JWT sessions with Credentials provider
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }

      // Handle session updates (e.g., from profile page)
      if (trigger === "update" && session) {
        token.name = session.name;
        token.image = session.image;
      }

      return token;
    },

    // Session callback - add token data to session
    async session({ session, token }) {
      console.log("📝 Building session from token");

      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
      }

      return session;
    },

    // ✅ Optional: Handle sign in events
    async signIn({ user, account }) {
      console.log("👤 Sign in callback:", {
        userId: user.id,
        provider: account?.provider,
      });

      // Allow sign in
      return true;
    },
  },

  events: {
    async signIn({ user }) {
      console.log("🎉 User signed in:", user.email);
    },
    async signOut() {
      console.log("👋 User signed out");
    },
  },

  secret: process.env.AUTH_SECRET,

  debug: process.env.NODE_ENV === "development",
});
