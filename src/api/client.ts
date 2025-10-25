import axios from "axios";

export const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

export const MEDIA_BASE =
  (import.meta as any)?.env?.VITE_MEDIA_URL ||
  (import.meta as any)?.env?.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") ||
  "http://127.0.0.1:8000";

/* ---------- robust token helpers ---------- */
function readStoredTokenRaw(): string | null {
  const candidates = [
    "auth_token",  // primary key we use
    "authToken",
    "access_token",
    "jwt",
    "token",
  ];
  for (const k of candidates) {
    const v = localStorage.getItem(k);
    if (v) return v;
  }
  return null;
}

/** If the token already includes a scheme (Token|Bearer), keep it.
 *  If it looks like a JWT, use Bearer; otherwise use Token.
 */
function buildAuthValue(): string | null {
  const raw = readStoredTokenRaw();
  if (!raw) return null;
  const v = raw.trim();
  if (/^(Token|Bearer)\s+/i.test(v)) return v;
  const isLikelyJwt = v.includes(".") || v.startsWith("eyJ");
  return `${isLikelyJwt ? "Bearer" : "Token"} ${v}`;
}

/* ---------- axios instance ---------- */
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false, // Token/JWT auth doesn't need cookies
});

/* Set default Authorization at boot (if present) */
const bootAuth = buildAuthValue();
if (bootAuth) {
  api.defaults.headers.common = api.defaults.headers.common || {};
  api.defaults.headers.common["Authorization"] = bootAuth;
}

/* Language header */
const getLang = () => {
  const fromLocal =
    localStorage.getItem("i18nextLng") || localStorage.getItem("app_lang");
  const lang = fromLocal || navigator.language || "en";
  return String(lang).split("-")[0]; // "en-US" -> "en"
};

/* Always refresh Authorization from storage on each request */
api.interceptors.request.use((config) => {
  (config.headers as any) = (config.headers as any) ?? {};
  (config.headers as any)["Accept-Language"] = getLang();

  if (!(config.headers as any).Authorization) {
    const v = buildAuthValue();
    if (v) (config.headers as any).Authorization = v;
  }
  return config;
});

/* --- multipart helpers --- */
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
