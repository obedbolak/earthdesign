// lib/api.ts
// Every data call from the web app goes through here to the EarthDesign API
// server (the same backend the mobile app uses).
//
// Configure with NEXT_PUBLIC_API_URL, the API's origin WITHOUT the /api suffix,
// e.g. https://api.earthdesignengineeringltd.com
import { getSession, signOut } from "next-auth/react";

import { apiUrl } from "@/lib/api-url";

export { API_BASE_URL, apiUrl } from "@/lib/api-url";

// The API token lives in the NextAuth session. getSession() is a network call,
// so keep the result briefly instead of asking on every request.
const TOKEN_CACHE_MS = 60_000;
let cachedToken: { value: string | null; at: number } | null = null;
let pendingToken: Promise<string | null> | null = null;

async function getAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null; // server code uses lib/api-server.ts
  if (cachedToken && Date.now() - cachedToken.at < TOKEN_CACHE_MS) {
    return cachedToken.value;
  }
  pendingToken ??= getSession()
    .then((session) => {
      const value = session?.accessToken ?? null;
      cachedToken = { value, at: Date.now() };
      return value;
    })
    .finally(() => {
      pendingToken = null;
    });
  return pendingToken;
}

/** Forget the cached token (after sign-in / sign-out). */
export function clearApiToken() {
  cachedToken = null;
}

/** Called by AuthProvider whenever the session changes. */
export function setApiToken(token: string | null) {
  cachedToken = { value: token, at: Date.now() };
}

/**
 * fetch() against the API with the signed-in user's bearer token attached.
 * If the API rejects the token (expired or revoked), the user is signed out
 * so they can sign in again and get a fresh one.
 */
export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = await getAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(apiUrl(path), { ...init, headers });

  if (response.status === 401 && token && typeof window !== "undefined") {
    clearApiToken();
    void signOut({ callbackUrl: "/auth/signin" });
  }
  return response;
}

/** SWR fetcher: GET a path from the API and return its JSON. */
export async function apiFetcher<T = any>(path: string): Promise<T> {
  const response = await apiFetch(path);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const error = new Error(
      body?.error || body?.message || "Failed to fetch data",
    ) as Error & { status?: number; info?: unknown };
    error.status = response.status;
    error.info = body;
    throw error;
  }
  return response.json();
}
