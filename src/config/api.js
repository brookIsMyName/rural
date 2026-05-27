const FALLBACK_API_URL = "https://rural-ujmh.onrender.com";

export const API_BASE =
  (import.meta.env.VITE_API_URL || FALLBACK_API_URL).replace(/\/+$/, "");
