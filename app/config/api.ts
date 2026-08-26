// NEXT_PUBLIC_ prefix means Next.js exposes this variable to the browser.
// The value comes from .env.local so you can change it without touching code.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:7288/api";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/i, "");

/**
 * Convert a stored file path into a browser URL.
 *
 * Uploads are no longer publicly served: `/uploads/{kind}/{file}` maps to the
 * authorization-checked `GET /api/files/{kind}/{file}` endpoint, which streams
 * the file only to permitted users (the JWT cookie rides along automatically).
 */
export function getApiFileUrl(filePath: string): string {
  if (/^https?:\/\//i.test(filePath)) return filePath;

  const normalized = filePath.replace(/^\/+/, "");
  if (normalized.startsWith("uploads/")) {
    return `${API_BASE_URL}/files/${normalized.slice("uploads/".length)}`;
  }

  // Fallback for any non-upload asset path.
  return `${API_ORIGIN}/${normalized}`;
}
