// NEXT_PUBLIC_ prefix means Next.js exposes this variable to the browser.
// The value comes from .env.local so you can change it without touching code.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:7288/api";
