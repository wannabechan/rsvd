/**
 * Browser auth adapter. Codes and passwords go through server APIs.
 * Session stays in localStorage until a shared session cookie is introduced.
 */

import {
  defaultNickname,
  isValidEmail,
  isValidPassword,
  normalizeEmail,
  userIdFromEmail,
  type AuthUser,
} from "@/domain/auth";

const SESSION_KEY = "rsvd:auth-session";

type ApiResult<T> = { ok: true } & T | { ok: false; error: string };

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
}

function normalizeSessionUser(value: unknown): AuthUser | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const raw = value as Partial<AuthUser> & { email?: string; id?: string };
  if (!raw.email || typeof raw.email !== "string") {
    return null;
  }
  const email = normalizeEmail(raw.email);
  return {
    id: typeof raw.id === "string" ? raw.id : userIdFromEmail(email),
    email,
    nickname:
      typeof raw.nickname === "string" && raw.nickname.trim()
        ? raw.nickname.trim()
        : defaultNickname(email),
    avatarUrl: typeof raw.avatarUrl === "string" ? raw.avatarUrl : null,
  };
}

export function readStoredSession(): AuthUser | null {
  return normalizeSessionUser(readJson<unknown>(SESSION_KEY, null));
}

export function writeStoredSession(user: AuthUser | null) {
  if (typeof window === "undefined") {
    return;
  }
  if (!user) {
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }
  writeJson(SESSION_KEY, normalizeSessionUser(user));
}

async function postJson<T>(url: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });
    const data = (await response.json()) as ApiResult<T>;
    if (!response.ok && !("error" in data)) {
      return { ok: false, error: "요청에 실패했습니다. 잠시 후 다시 시도해 주세요." };
    }
    return data;
  } catch {
    return { ok: false, error: "네트워크 오류가 발생했습니다." };
  }
}

export async function requestLoginCode(
  email: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isValidEmail(email)) {
    return { ok: false, error: "올바른 이메일을 입력해 주세요." };
  }
  return postJson("/api/auth/request-code", { email });
}

export async function loginWithCode(
  email: string,
  code: string,
): Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }> {
  const result = await postJson<{ user: AuthUser }>("/api/auth/verify-code", {
    email,
    code,
  });
  if (!result.ok) {
    return result;
  }
  const user = normalizeSessionUser(result.user);
  if (!user) {
    return { ok: false, error: "로그인 응답이 올바르지 않습니다." };
  }
  writeStoredSession(user);
  return { ok: true, user };
}

export async function checkPasswordLogin(
  email: string,
): Promise<{ ok: true; hasPassword: boolean } | { ok: false; error: string }> {
  if (!isValidEmail(email)) {
    return { ok: false, error: "올바른 이메일을 입력해 주세요." };
  }
  return postJson<{ hasPassword: boolean }>("/api/auth/password-status", {
    email: normalizeEmail(email),
  });
}

export async function setupPasswordLogin(
  email: string,
  code: string,
  password: string,
): Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }> {
  if (!isValidPassword(password)) {
    return { ok: false, error: "비밀번호는 6자 이상이어야 합니다." };
  }

  const result = await postJson<{ user: AuthUser }>("/api/auth/setup-password", {
    email,
    code,
    password,
  });
  if (!result.ok) {
    return result;
  }
  const user = normalizeSessionUser(result.user);
  if (!user) {
    return { ok: false, error: "로그인 응답이 올바르지 않습니다." };
  }
  writeStoredSession(user);
  return { ok: true, user };
}

export async function loginWithPassword(
  email: string,
  password: string,
): Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }> {
  if (!isValidEmail(email)) {
    return { ok: false, error: "올바른 이메일을 입력해 주세요." };
  }
  if (!isValidPassword(password)) {
    return { ok: false, error: "비밀번호는 6자 이상이어야 합니다." };
  }

  const result = await postJson<{ user: AuthUser }>("/api/auth/login-password", {
    email: normalizeEmail(email),
    password,
  });
  if (!result.ok) {
    return result;
  }
  const user = normalizeSessionUser(result.user);
  if (!user) {
    return { ok: false, error: "로그인 응답이 올바르지 않습니다." };
  }
  writeStoredSession(user);
  return { ok: true, user };
}

export async function fetchProfile(
  email: string,
): Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }> {
  try {
    const response = await fetch(
      `/api/profile?e=${encodeURIComponent(normalizeEmail(email))}`,
      { credentials: "same-origin" },
    );
    const data = (await response.json()) as ApiResult<{ user: AuthUser }>;
    if (!data.ok) {
      return data;
    }
    const user = normalizeSessionUser(data.user);
    if (!user) {
      return { ok: false, error: "프로필 응답이 올바르지 않습니다." };
    }
    writeStoredSession(user);
    return { ok: true, user };
  } catch {
    return { ok: false, error: "네트워크 오류가 발생했습니다." };
  }
}

export async function saveNickname(
  email: string,
  nickname: string,
): Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }> {
  const result = await postJson<{ user: AuthUser }>("/api/profile", {
    email: normalizeEmail(email),
    nickname,
  });
  if (!result.ok) {
    return result;
  }
  const user = normalizeSessionUser(result.user);
  if (!user) {
    return { ok: false, error: "프로필 응답이 올바르지 않습니다." };
  }
  writeStoredSession(user);
  return { ok: true, user };
}

export async function uploadAvatar(
  email: string,
  webpBlob: Blob,
): Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }> {
  try {
    const form = new FormData();
    form.set("email", normalizeEmail(email));
    form.set("avatar", webpBlob, "avatar.webp");
    const response = await fetch("/api/profile/avatar", {
      method: "POST",
      credentials: "same-origin",
      body: form,
    });
    const data = (await response.json()) as ApiResult<{ user: AuthUser }>;
    if (!data.ok) {
      return data;
    }
    const user = normalizeSessionUser(data.user);
    if (!user) {
      return { ok: false, error: "프로필 응답이 올바르지 않습니다." };
    }
    writeStoredSession(user);
    return { ok: true, user };
  } catch {
    return { ok: false, error: "네트워크 오류가 발생했습니다." };
  }
}

export async function removeAvatar(
  email: string,
): Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }> {
  try {
    const response = await fetch(
      `/api/profile/avatar?e=${encodeURIComponent(normalizeEmail(email))}`,
      { method: "DELETE", credentials: "same-origin" },
    );
    const data = (await response.json()) as ApiResult<{ user: AuthUser }>;
    if (!data.ok) {
      return data;
    }
    const user = normalizeSessionUser(data.user);
    if (!user) {
      return { ok: false, error: "프로필 응답이 올바르지 않습니다." };
    }
    writeStoredSession(user);
    return { ok: true, user };
  } catch {
    return { ok: false, error: "네트워크 오류가 발생했습니다." };
  }
}
