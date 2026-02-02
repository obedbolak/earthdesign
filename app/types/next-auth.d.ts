// types/next-auth.d.ts
import { UserRole } from "@prisma/client";
import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
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
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: UserRole;
    phone: string | null;
    agencyName: string | null;
    agencyLogo: string | null;
    bio: string | null;
    whatsapp: string | null;
    isVerified: boolean;
    emailVerified: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
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
