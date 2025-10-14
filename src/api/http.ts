// src/api/http.ts
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api";

function authHeaders() {
  const token = localStorage.getItem("auth_token") || localStorage.getItem("authToken");
  return token ? { Authorization: `Token ${token}` } : {};
}

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
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function uploadForm<T = any>(path: string, form: FormData): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: form,
    credentials: "include",
    headers: {
      ...authHeaders(),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
