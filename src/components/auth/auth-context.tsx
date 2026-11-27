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
  checkPasswordLogin,
  fetchProfile,
  loginWithCode,
  loginWithPassword,
  readStoredSession,
  clearPhone as clearPhoneRequest,
  removeAvatar as removeAvatarRequest,
  requestLoginCode,
  requestPhoneCode as requestPhoneCodeRequest,
  saveNickname as saveNicknameRequest,
  setupPasswordLogin,
  uploadAvatar as uploadAvatarRequest,
  verifyPhoneCode as verifyPhoneCodeRequest,
  writeStoredSession,
} from "@/data/auth-client";
import type { AuthUser } from "@/domain/auth";

type AuthContextValue = {
  user: AuthUser | null;
  isReady: boolean;
  isLoggedIn: boolean;
  logout: () => void;
  refreshProfile: () => Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }>;
  saveNickname: (
    nickname: string,
  ) => Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }>;
  uploadAvatar: (
    webpBlob: Blob,
  ) => Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }>;
  removeAvatar: () => Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }>;
  requestPhoneCode: (
    phone: string,
  ) => Promise<{ ok: true; debugCode?: string } | { ok: false; error: string }>;
  verifyPhone: (
    phone: string,
    code: string,
  ) => Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }>;
  clearPhone: () => Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }>;
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
  checkCanUsePasswordLogin: (
    email: string,
  ) => Promise<{ ok: true; hasPassword: boolean } | { ok: false; error: string }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const session = readStoredSession();
    setUser(session);
    setIsReady(true);
    if (!session) {
      return;
    }
    void fetchProfile(session.email).then((result) => {
      if (result.ok) {
        setUser(result.user);
      }
    });
  }, []);

  const logout = useCallback(() => {
    writeStoredSession(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      return { ok: false as const, error: "로그인이 필요합니다." };
    }
    const result = await fetchProfile(user.email);
    if (result.ok) {
      setUser(result.user);
    }
    return result;
  }, [user]);

  const saveNickname = useCallback(
    async (nickname: string) => {
      if (!user) {
        return { ok: false as const, error: "로그인이 필요합니다." };
      }
      const result = await saveNicknameRequest(user.email, nickname);
      if (result.ok) {
        setUser(result.user);
      }
      return result;
    },
    [user],
  );

  const uploadAvatar = useCallback(
    async (webpBlob: Blob) => {
      if (!user) {
        return { ok: false as const, error: "로그인이 필요합니다." };
      }
      const result = await uploadAvatarRequest(user.email, webpBlob);
      if (result.ok) {
        setUser(result.user);
      }
      return result;
    },
    [user],
  );

  const removeAvatar = useCallback(async () => {
    if (!user) {
      return { ok: false as const, error: "로그인이 필요합니다." };
    }
    const result = await removeAvatarRequest(user.email);
    if (result.ok) {
      setUser(result.user);
    }
    return result;
  }, [user]);

  const requestPhoneCode = useCallback(
    async (phone: string) => {
      if (!user) {
        return { ok: false as const, error: "로그인이 필요합니다." };
      }
      return requestPhoneCodeRequest(user.email, phone);
    },
    [user],
  );

  const verifyPhone = useCallback(
    async (phone: string, code: string) => {
      if (!user) {
        return { ok: false as const, error: "로그인이 필요합니다." };
      }
      const result = await verifyPhoneCodeRequest(user.email, phone, code);
      if (result.ok) {
        setUser(result.user);
      }
      return result;
    },
    [user],
  );

  const clearPhone = useCallback(async () => {
    if (!user) {
      return { ok: false as const, error: "로그인이 필요합니다." };
    }
    const result = await clearPhoneRequest(user.email);
    if (result.ok) {
      setUser(result.user);
    }
    return result;
  }, [user]);

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

  const checkCanUsePasswordLogin = useCallback(
    async (email: string) => checkPasswordLogin(email),
    [],
  );

  const value = useMemo(
    () => ({
      user,
      isReady,
      isLoggedIn: Boolean(user),
      logout,
      refreshProfile,
      saveNickname,
      uploadAvatar,
      removeAvatar,
      requestPhoneCode,
      verifyPhone,
      clearPhone,
      requestCode,
      loginByCode,
      loginByPassword,
      setupPassword,
      checkCanUsePasswordLogin,
    }),
    [
      user,
      isReady,
      logout,
      refreshProfile,
      saveNickname,
      uploadAvatar,
      removeAvatar,
      requestPhoneCode,
      verifyPhone,
      clearPhone,
      requestCode,
      loginByCode,
      loginByPassword,
      setupPassword,
      checkCanUsePasswordLogin,
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
