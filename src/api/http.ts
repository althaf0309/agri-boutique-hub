export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api";

/* ---------- robust token → header ---------- */
function getAuthTokenRaw(): string | null {
  const candidates = [
    "auth_token",  // primary key we use
    "authToken",
    "access_token",
    "jwt",
    "token",
  ];
  for (const k of candidates) {
    const v = localStorage.getItem(k);
    if (v) return v.trim();
  }
  return null;
}

/** Always return a scheme. If not present, default to DRF Token scheme. */
export function authHeaders(): Record<string, string> {
  const raw = getAuthTokenRaw();
  if (!raw) return {};
  if (/^(Token|Bearer)\s+/i.test(raw)) return { Authorization: raw };
  return { Authorization: `Token ${raw}` };
}

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `${res.status} ${res.statusText}`);
  }
  if (res.status === 204) return null as any;
  return res.json() as Promise<T>;
}

/** JSON helper (fetch) */
export async function api<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(init?.headers || {}),
    },
    credentials: "include",
    ...init,
  });
  return handleJson<T>(res);
}

/** Multipart helper (fetch) — do NOT set Content-Type manually */
export async function uploadForm<T = any>(path: string, form: FormData): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: form,
    credentials: "include",
    headers: {
      ...authHeaders(), // critical: attach Authorization
    },
  });
  return handleJson<T>(res);
}
