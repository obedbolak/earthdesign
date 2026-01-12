// hooks/useAuth.ts
"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";

export function useAuth() {
  const { data: session, status } = useSession();
  console.log("Session data:", session);

  const user = useMemo(() => {
    if (!session?.user) return null;

    return {
      id: session.user.id as string,
      email: session.user.email || "",
      name: session.user.name || "User",
      image: session.user.image || null,
      role: (session.user as any).role as "USER" | "AGENT" | "ADMIN",
    };
  }, [session]);

  return {
    user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isAdmin: user?.role === "ADMIN",
    isAgent: user?.role === "AGENT",
    status,
  };
}
