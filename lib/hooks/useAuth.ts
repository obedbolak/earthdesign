// lib/hooks/useAuth.ts
import { useSession } from "next-auth/react";
import { useMemo } from "react";

export function useAuth() {
  const { data: session, status } = useSession();

  const authState = useMemo(() => {
    const isLoading = status === "loading";
    const isAuthenticated = status === "authenticated" && !!session?.user;

    // Get user from session
    const user = session?.user || null;

    // Role checks
    const isAdmin = user?.role?.toUpperCase() === "ADMIN";
    const isAgent = user?.role?.toUpperCase() === "AGENT";
    const isUser = user?.role?.toUpperCase() === "USER";

    return {
      user,
      session,
      isLoading,
      isAuthenticated,
      isAdmin,
      isAgent,
      isUser,
      status,
    };
  }, [session, status]);

  return authState;
}

export type AuthState = ReturnType<typeof useAuth>;
