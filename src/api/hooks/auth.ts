// src/api/auth.ts
import { useMutation } from "@tanstack/react-query";
import api from "@/api/client";

const AUTH_KEY = "auth_token";
const EMAIL_KEY = "userEmail";

function setAuth(token: string, email?: string) {
  localStorage.setItem(AUTH_KEY, token);
  if (email) localStorage.setItem(EMAIL_KEY, email);
  (api as any).defaults ??= {};
  (api as any).defaults.headers ??= {};
  (api as any).defaults.headers.common ??= {};
  (api as any).defaults.headers.common["Authorization"] = `Token ${token}`;
}

function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(EMAIL_KEY);
  if ((api as any).defaults?.headers?.common) {
    delete (api as any).defaults.headers.common["Authorization"];
  }
}

type LoginPayload = { email: string; password: string } | { username: string; password: string };
type LoginResponse = { token: string };

export function useLogin() {
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const email = "email" in payload ? payload.email : (payload as any).username;
      const password = payload.password;

      try {
        const { data } = await api.post<LoginResponse>("/auth/token/", { email, password });
        setAuth(data.token, email);
        return data;
      } catch (err: any) {
        // legacy fallback
        if (!("email" in payload)) throw err;
        const { data } = await api.post<LoginResponse>("/auth/token/", { username: email, password });
        setAuth(data.token, email);
        return data;
      }
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      clearAuth();
      return true;
    },
  });
}

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_KEY);
}
export function getStoredEmail(): string | null {
  return localStorage.getItem(EMAIL_KEY);
}
