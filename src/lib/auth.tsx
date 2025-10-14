// src/lib/auth.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "@/api/client";

export type AuthUser = {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_vendor?: boolean;
};

type AuthContextType = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  refreshMe: () => Promise<AuthUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = "auth_token";
const EMAIL_KEY = "user_email";

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(AUTH_KEY));
  const [user, setUser] = useState<AuthUser | null>(null);
  const isAuthenticated = !!token;

  // keep storage in sync
  useEffect(() => {
    if (token) localStorage.setItem(AUTH_KEY, token);
    else localStorage.removeItem(AUTH_KEY);
  }, [token]);

  // On boot, if there is a token, try loading /auth/me/
  useEffect(() => {
    const boot = async () => {
      const t = localStorage.getItem(AUTH_KEY);
      if (!t) {
        setUser(null);
        return;
      }
      setAuth(t);
      try {
        const { data } = await api.get<AuthUser>("/auth/me/");
        setUser(data);
      } catch {
        setUser(null);
      }
    };
    boot();
  }, []);

  const refreshMe = async () => {
    const { data } = await api.get<AuthUser>("/auth/me/");
    setUser(data);
    return data;
  };

  const login = async (email: string, password: string) => {
    const r = await api.post<{ token: string }>("/auth/token/", { email, password });
    if (!r.data?.token) throw new Error("No token in response");
    setToken(r.data.token);
    setAuth(r.data.token, email);
    const me = await refreshMe(); // load roles/flags
    return me;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    clearAuth();
  };

  const value = useMemo(
    () => ({ token, user, isAuthenticated, login, refreshMe, logout }),
    [token, user, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** Guard for any authed-only page */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Guard for admin area (superuser only) */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user && user.is_superuser) {
    return <>{children}</>;
  }
  // signed in but not superuser → send to home
  return <Navigate to="/" replace />;
}

/**
 * Wrapper for pages like /login:
 * - If already signed in:
 *   - superuser → /admin
 *   - others → /
 * - Else show the wrapped page (e.g. <Login />)
 */
export function RoleRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <>{children}</>;
  if (user?.is_superuser) return <Navigate to="/admin" replace />;
  return <Navigate to="/" replace />;
}
