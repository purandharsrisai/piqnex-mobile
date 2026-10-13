import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { apiFetch, loadToken, setToken, setUnauthorizedHandler } from "@/lib/api";
import type { CurrentUser } from "@/lib/data";

interface AuthResponse { accessToken: string }

interface AuthValue {
  user: CurrentUser | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (b: { email: string; password: string; displayName: string; phone: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  /** Runs `fn` if signed in, otherwise sends the person to the login screen. */
  requireAuth: (fn: () => void) => void;
}

const Ctx = createContext<AuthValue | null>(null);
export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const t = await loadToken();
    if (!t) { setUser(null); return; }
    try {
      setUser(await apiFetch<CurrentUser>("/profile/me"));
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => { refresh().finally(() => setReady(true)); }, [refresh]);

  useEffect(() => {
    // An expired/invalid token anywhere in the app signs the person out.
    setUnauthorizedHandler(() => { setToken(null).then(() => setUser(null)); });
    return () => setUnauthorizedHandler(null);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const r = await apiFetch<AuthResponse>("/auth/login", { method: "POST", authenticated: false, body: { email, password } });
    await setToken(r.accessToken);
    await refresh();
  }, [refresh]);

  const signUp = useCallback(async (b: { email: string; password: string; displayName: string; phone: string }) => {
    const r = await apiFetch<AuthResponse>("/auth/signup", { method: "POST", authenticated: false, body: b });
    await setToken(r.accessToken);
    await refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    try { await apiFetch("/auth/logout", { method: "POST" }); } catch { /* still sign out locally */ }
    await setToken(null);
    setUser(null);
  }, []);

  const requireAuth = useCallback((fn: () => void) => {
    if (user) fn();
    else router.push("/login");
  }, [user, router]);

  const value = useMemo(() => ({ user, ready, signIn, signUp, signOut, refresh, requireAuth }), [user, ready, signIn, signUp, signOut, refresh, requireAuth]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
