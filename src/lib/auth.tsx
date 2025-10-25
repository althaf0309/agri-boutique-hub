import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "@/api/client";
import { clear as clearCart } from "@/lib/cart";

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
  booting: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<AuthUser>;
  refreshMe: () => Promise<AuthUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Use one consistent set of keys across the app
const AUTH_KEY = "auth_token";
const EMAIL_KEY = "user_email";

function readToken(): string | null {
  return localStorage.getItem(AUTH_KEY) || sessionStorage.getItem(AUTH_KEY);
}

function writeToken(token: string, remember?: boolean, email?: string) {
  // clear both to avoid duplicates
  localStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_KEY);

  if (remember) localStorage.setItem(AUTH_KEY, token);
  else sessionStorage.setItem(AUTH_KEY, token);

  if (email) localStorage.setItem(EMAIL_KEY, email);

  (api as any).defaults ??= {};
  (api as any).defaults.headers ??= {};
  (api as any).defaults.headers.common ??= {};
  (api as any).defaults.headers.common["Authorization"] = `Token ${token}`;
}

function clearToken() {
  localStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(EMAIL_KEY);
  if ((api as any).defaults?.headers?.common) {
    delete (api as any).defaults.headers.common["Authorization"];
  }
}

function Loader() {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="text-muted-foreground">Loading…</div>
    </div>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => readToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [booting, setBooting] = useState<boolean>(true);
  const isAuthenticated = !!token;

  // Boot: if token exists, fetch /auth/me
  useEffect(() => {
    const boot = async () => {
      setBooting(true);
      const t = readToken();
      if (!t) {
        setUser(null);
        setBooting(false);
        return;
      }
      (api as any).defaults ??= {};
      (api as any).defaults.headers ??= {};
      (api as any).defaults.headers.common ??= {};
      (api as any).defaults.headers.common["Authorization"] = `Token ${t}`;
      try {
        const { data } = await api.get<AuthUser>("/auth/me/");
        setUser(data);
        setToken(t);
      } catch {
        clearToken();
        setUser(null);
        setToken(null);
      } finally {
        setBooting(false);
      }
    };
    boot();
  }, []);

  const refreshMe = async () => {
    const { data } = await api.get<AuthUser>("/auth/me/");
    setUser(data);
    return data;
  };

  const logout = () => {
    clearToken();
    setToken(null);
    setUser(null);
    // 🔥 ensure cart is wiped locally + tell server best-effort
    try {
      clearCart();
    } catch {
      /* ignore */
    }
  };

  const login = async (email: string, password: string, remember?: boolean) => {
    const r = await api.post<{ token: string }>("/auth/token/", { email, password });
    if (!r.data?.token) throw new Error("No token in response");

    // Remember previous identity to isolate carts between users
    const prevEmail = localStorage.getItem(EMAIL_KEY) || undefined;

    writeToken(r.data.token, remember, email);
    setToken(r.data.token);

    const me = await refreshMe();

    // If user switched, clear cart so carts don't leak between identities
    if (prevEmail && prevEmail !== me.email) {
      try {
        clearCart();
      } catch {
        /* ignore */
      }
    }
    return me;
  };

  const value = useMemo(
    () => ({ token, user, isAuthenticated, booting, login, refreshMe, logout }),
    [token, user, isAuthenticated, booting]
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
  const { isAuthenticated, booting } = useAuth();
  if (booting) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Guard for admin area (superuser only) */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, booting } = useAuth();
  if (booting) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.is_superuser) return <>{children}</>;
  if (user) return <Navigate to="/" replace />;
  return <Navigate to="/login" replace />;
}

/**
 * Wrapper for pages like /login:
 * - If already signed in:
 *   - superuser → /admin
 *   - others → /
 * - Else show the wrapped page (e.g. <Login />)
 */
export function RoleRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, booting } = useAuth();
  if (booting) return <Loader />;
  if (!isAuthenticated) return <>{children}</>;
  if (user?.is_superuser) return <Navigate to="/admin" replace />;
  return <Navigate to="/" replace />;
}
