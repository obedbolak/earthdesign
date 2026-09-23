// lib/auth.ts
import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { UserRole } from "@/lib/user-role";
import { apiUrl } from "@/lib/api-url";

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
    /** Bearer token for the EarthDesign API. */
    accessToken?: string;
  }

  interface User {
    role: UserRole;
    phone: string | null;
    agencyName: string | null;
    agencyLogo: string | null;
    bio: string | null;
    whatsapp: string | null;
    isVerified: boolean;
    accessToken?: string;
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
    accessToken?: string;
  }
}

type ApiLoginResponse = {
  token?: string;
  accessToken?: string;
  user?: {
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
    emailVerified: string | null;
  };
  error?: string;
  message?: string;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // Sign-in is checked by the EarthDesign API. The API token is kept in the
      // session so the browser can call the API on the user's behalf.
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        let response: Response;
        try {
          response = await fetch(apiUrl("/auth/login"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            cache: "no-store",
          });
        } catch (error) {
          console.error("❌ Could not reach the API for sign-in:", error);
          throw new Error("Sign-in is unavailable right now. Please try again.");
        }

        const data = (await response
          .json()
          .catch(() => ({}))) as ApiLoginResponse;

        // Wrong email or password → NextAuth's standard "CredentialsSignin".
        if (response.status === 401) return null;
        // Unverified email and other refusals: show the API's message.
        if (!response.ok) {
          throw new Error(data.error || data.message || "Sign-in failed");
        }

        const accessToken = data.accessToken || data.token;
        const user = data.user;
        if (!accessToken || !user?.id) {
          throw new Error("Sign-in failed: incomplete response from the API");
        }

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
          emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
          accessToken,
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

      if (user?.accessToken) {
        token.accessToken = user.accessToken;
      }

      // Handles sessions created before `id` was stored on the token.
      if (!token.id && token.sub) {
        token.id = token.sub;
      }

      // useSession().update({...}) — e.g. after a profile photo change.
      if (trigger === "update" && session) {
        const editable = [
          "name",
          "image",
          "phone",
          "agencyName",
          "agencyLogo",
          "bio",
          "whatsapp",
        ] as const;
        for (const field of editable) {
          if (field in session) {
            (token as Record<string, unknown>)[field] = session[field] ?? null;
          }
        }
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
      session.accessToken = token.accessToken;
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
