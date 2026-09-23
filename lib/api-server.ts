// lib/api-server.ts
// API calls made from server components and NextAuth, using the token stored
// in the server-side session.
import { auth } from "@/lib/auth";
import { apiUrl } from "@/lib/api-url";

export async function serverApiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const session = await auth();
  const headers = new Headers(init.headers);
  if (session?.accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }
  return fetch(apiUrl(path), { cache: "no-store", ...init, headers });
}

/** GET JSON from the API on the server; throws on a non-2xx response. */
export async function serverApiJson<T = any>(path: string): Promise<T> {
  const response = await serverApiFetch(path);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.error || body?.message || `API request failed (${response.status})`,
    );
  }
  return response.json();
}
