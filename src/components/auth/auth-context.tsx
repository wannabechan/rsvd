"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  hasPasswordLogin,
  loginWithCode,
  loginWithPassword,
  readStoredSession,
  requestLoginCode,
  setupPasswordLogin,
  writeStoredSession,
} from "@/data/auth-client";
import type { AuthUser } from "@/domain/auth";

type AuthContextValue = {
  user: AuthUser | null;
  isReady: boolean;
  isLoggedIn: boolean;
  logout: () => void;
  requestCode: (email: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  loginByCode: (
    email: string,
    code: string,
  ) => Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }>;
  loginByPassword: (
    email: string,
    password: string,
  ) => Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }>;
  setupPassword: (
    email: string,
    code: string,
    password: string,
  ) => Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }>;
  canUsePasswordLogin: (email: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setUser(readStoredSession());
    setIsReady(true);
  }, []);

  const logout = useCallback(() => {
    writeStoredSession(null);
    setUser(null);
  }, []);

  const requestCode = useCallback(async (email: string) => requestLoginCode(email), []);

  const loginByCode = useCallback(async (email: string, code: string) => {
    const result = await loginWithCode(email, code);
    if (result.ok) {
      setUser(result.user);
    }
    return result;
  }, []);

  const loginByPassword = useCallback(async (email: string, password: string) => {
    const result = await loginWithPassword(email, password);
    if (result.ok) {
      setUser(result.user);
    }
    return result;
  }, []);

  const setupPassword = useCallback(
    async (email: string, code: string, password: string) => {
      const result = await setupPasswordLogin(email, code, password);
      if (result.ok) {
        setUser(result.user);
      }
      return result;
    },
    [],
  );

  const canUsePasswordLogin = useCallback((email: string) => hasPasswordLogin(email), []);

  const value = useMemo(
    () => ({
      user,
      isReady,
      isLoggedIn: Boolean(user),
      logout,
      requestCode,
      loginByCode,
      loginByPassword,
      setupPassword,
      canUsePasswordLogin,
    }),
    [
      user,
      isReady,
      logout,
      requestCode,
      loginByCode,
      loginByPassword,
      setupPassword,
      canUsePasswordLogin,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
