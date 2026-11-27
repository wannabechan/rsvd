/**
 * Sample auth adapter. Swap for a real API later without changing UI/domain contracts.
 * In sample mode, login codes are fixed so local testing works without email delivery.
 */

import {
  isValidEmail,
  isValidLoginCode,
  isValidPassword,
  normalizeEmail,
  userIdFromEmail,
  type AuthUser,
} from "@/domain/auth";

const SESSION_KEY = "rsvd:auth-session";
const PASSWORD_UNLOCK_KEY = "rsvd:password-unlocked";
const PASSWORD_STORE_KEY = "rsvd:password-store";

/** Sample-only code so QA works without a mailer. */
export const SAMPLE_LOGIN_CODE = "123456";

type PasswordStore = Record<string, string>;

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

export function readStoredSession(): AuthUser | null {
  return readJson<AuthUser | null>(SESSION_KEY, null);
}

export function writeStoredSession(user: AuthUser | null) {
  if (typeof window === "undefined") {
    return;
  }
  if (!user) {
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }
  writeJson(SESSION_KEY, user);
}

export function hasPasswordLogin(email: string): boolean {
  const unlocked = readJson<string[]>(PASSWORD_UNLOCK_KEY, []);
  return unlocked.includes(normalizeEmail(email));
}

function markPasswordUnlocked(email: string) {
  const normalized = normalizeEmail(email);
  const unlocked = readJson<string[]>(PASSWORD_UNLOCK_KEY, []);
  if (!unlocked.includes(normalized)) {
    writeJson(PASSWORD_UNLOCK_KEY, [...unlocked, normalized]);
  }
}

function savePassword(email: string, password: string) {
  const store = readJson<PasswordStore>(PASSWORD_STORE_KEY, {});
  store[normalizeEmail(email)] = password;
  writeJson(PASSWORD_STORE_KEY, store);
}

function readPassword(email: string): string | null {
  const store = readJson<PasswordStore>(PASSWORD_STORE_KEY, {});
  return store[normalizeEmail(email)] ?? null;
}

function delay(ms = 450) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function requestLoginCode(email: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await delay();
  if (!isValidEmail(email)) {
    return { ok: false, error: "올바른 이메일을 입력해 주세요." };
  }
  // Sample: pretend the mail was sent. Real API would deliver SAMPLE_LOGIN_CODE equivalent.
  return { ok: true };
}

export async function loginWithCode(
  email: string,
  code: string,
): Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }> {
  await delay();
  if (!isValidEmail(email)) {
    return { ok: false, error: "올바른 이메일을 입력해 주세요." };
  }
  if (!isValidLoginCode(code)) {
    return { ok: false, error: "6자리 숫자 코드를 입력해 주세요." };
  }
  if (code.trim() !== SAMPLE_LOGIN_CODE) {
    return { ok: false, error: "로그인 코드가 올바르지 않습니다." };
  }

  const user: AuthUser = {
    id: userIdFromEmail(email),
    email: normalizeEmail(email),
  };
  writeStoredSession(user);
  return { ok: true, user };
}

export async function setupPasswordLogin(
  email: string,
  code: string,
  password: string,
): Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }> {
  await delay();
  if (!isValidEmail(email)) {
    return { ok: false, error: "올바른 이메일을 입력해 주세요." };
  }
  if (!isValidLoginCode(code)) {
    return { ok: false, error: "6자리 숫자 코드를 입력해 주세요." };
  }
  if (code.trim() !== SAMPLE_LOGIN_CODE) {
    return { ok: false, error: "로그인 코드가 올바르지 않습니다." };
  }
  if (!isValidPassword(password)) {
    return { ok: false, error: "비밀번호는 6자 이상이어야 합니다." };
  }

  savePassword(email, password.trim());
  markPasswordUnlocked(email);

  const user: AuthUser = {
    id: userIdFromEmail(email),
    email: normalizeEmail(email),
  };
  writeStoredSession(user);
  return { ok: true, user };
}

export async function loginWithPassword(
  email: string,
  password: string,
): Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }> {
  await delay();
  if (!isValidEmail(email)) {
    return { ok: false, error: "올바른 이메일을 입력해 주세요." };
  }
  if (!hasPasswordLogin(email)) {
    return { ok: false, error: "비밀번호 로그인을 먼저 설정해 주세요." };
  }
  if (!isValidPassword(password)) {
    return { ok: false, error: "비밀번호는 6자 이상이어야 합니다." };
  }

  const saved = readPassword(email);
  if (!saved || saved !== password.trim()) {
    return { ok: false, error: "비밀번호가 올바르지 않습니다." };
  }

  const user: AuthUser = {
    id: userIdFromEmail(email),
    email: normalizeEmail(email),
  };
  writeStoredSession(user);
  return { ok: true, user };
}
