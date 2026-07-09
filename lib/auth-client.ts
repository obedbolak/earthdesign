// lib/auth-client.ts
"use client";

import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    session,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    user: session?.user,
    role: session?.user?.role,
  };
}
