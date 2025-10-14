// src/lib/api.ts
const RAW_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
const API_BASE = RAW_BASE.replace(/\/+$/, "");

function joinUrl(path: string) {
  const p = path.replace(/^\/+/, "");
  return `${API_BASE}/${p}`;
}

function authHeaders() {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Token ${token}` } : {};
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(joinUrl(path), {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
  const res = await fetch(joinUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}
