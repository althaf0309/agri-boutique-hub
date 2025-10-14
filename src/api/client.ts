// src/api/client.ts
import axios from "axios";

export const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

// Useful if you build absolute media URLs elsewhere
export const MEDIA_BASE =
  (import.meta as any)?.env?.VITE_MEDIA_URL ||
  (import.meta as any)?.env?.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") ||
  "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false, // DRF token auth doesn't need cookies/CSRF
});

// Load token on boot so refresh keeps you authed
const stored = localStorage.getItem("auth_token");
if (stored) {
  api.defaults.headers.common = api.defaults.headers.common || {};
  api.defaults.headers.common["Authorization"] = `Token ${stored}`;
}

const getLang = () => {
  const fromLocal =
    localStorage.getItem("i18nextLng") || localStorage.getItem("app_lang");
  const lang = fromLocal || navigator.language || "en";
  return String(lang).split("-")[0]; // "en-US" -> "en"
};

api.interceptors.request.use((config) => {
  (config.headers as any) = (config.headers as any) ?? {};
  (config.headers as any)["Accept-Language"] = getLang();

  // If defaults were cleared, still patch from storage:
  if (!(config.headers as any).Authorization) {
    const t = localStorage.getItem("auth_token");
    if (t) (config.headers as any).Authorization = `Token ${t}`;
  }
  return config;
});

// --- multipart helpers (restored) ---
export function postMultipart<T = any>(url: string, form: FormData) {
  return api.post<T>(url, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function patchMultipart<T = any>(url: string, form: FormData) {
  return api.patch<T>(url, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export default api;
