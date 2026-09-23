// lib/api-url.ts
// Where the EarthDesign API lives. Safe to import from server and client code.
//
// NEXT_PUBLIC_API_URL is the API's origin WITHOUT the /api suffix,
// e.g. https://api.earthdesignengineeringltd.com
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

/** "/data/batiment" or "/api/data/batiment" → full API URL. */
export function apiUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const withPrefix =
    clean === "/api" || clean.startsWith("/api/") || clean.startsWith("/api?")
      ? clean
      : `/api${clean}`;
  return `${API_BASE_URL}${withPrefix}`;
}
