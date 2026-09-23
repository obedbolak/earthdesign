// app/AuthProvider.tsx
"use client";

import { useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { Session } from "next-auth";
import { setApiToken } from "@/lib/api";

interface AuthProviderProps {
  children: React.ReactNode;
  session: Session | null;
}

/** Keeps the API client's bearer token in step with sign-in and sign-out. */
function ApiTokenSync() {
  const { data: session, status } = useSession();
  const token = session?.accessToken ?? null;

  useEffect(() => {
    if (status !== "loading") setApiToken(token);
  }, [token, status]);

  return null;
}

let seeded = false;

export default function AuthProvider({ children, session }: AuthProviderProps) {
  // Seed the token once, before children render, so their first requests are
  // signed. Later changes come through ApiTokenSync.
  if (typeof window !== "undefined" && !seeded) {
    seeded = true;
    setApiToken(session?.accessToken ?? null);
  }

  return (
    <SessionProvider session={session}>
      <ApiTokenSync />
      {children}
    </SessionProvider>
  );
}
