/**
 * Platform-agnostic auth domain.
 * Keep free of React/Next/DOM so native shells can reuse the same rules.
 */

export type AuthUser = {
  id: string;
  email: string;
  /** Display name; defaults to email local-part. */
  nickname: string;
  /** Public avatar image URL, or null for letter+tone fallback. */
  avatarUrl: string | null;
};

export type UserProfile = {
  nickname: string;
  /** When true, avatar bytes exist in the user store. */
  hasAvatar: boolean;
  /** Cache-busting version for avatar URL. */
  avatarVersion: number;
};

export type LoginStep = "email" | "code" | "password" | "password-setup";

export const NICKNAME_MAX_LENGTH = 20;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  const value = normalizeEmail(email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidLoginCode(code: string): boolean {
  return /^\d{6}$/.test(code.trim());
}

export function isValidPassword(password: string): boolean {
  return password.trim().length >= 6;
}

export function userIdFromEmail(email: string): string {
  return `user:${normalizeEmail(email)}`;
}

/** Local-part before @ (display label). */
export function emailLocalPart(email: string): string {
  const normalized = normalizeEmail(email);
  const at = normalized.indexOf("@");
  return at === -1 ? normalized : normalized.slice(0, at);
}

/** Default nickname: text before @. */
export function defaultNickname(email: string): string {
  return emailLocalPart(email);
}

export function normalizeNickname(nickname: string, email: string): string {
  const trimmed = nickname.trim().replace(/\s+/g, " ");
  if (!trimmed) {
    return defaultNickname(email);
  }
  return trimmed.slice(0, NICKNAME_MAX_LENGTH);
}

export function isValidNickname(nickname: string): boolean {
  const trimmed = nickname.trim();
  return trimmed.length >= 1 && trimmed.length <= NICKNAME_MAX_LENGTH;
}

export function avatarPublicPath(email: string, version: number): string {
  return `/api/profile/avatar?e=${encodeURIComponent(normalizeEmail(email))}&v=${version}`;
}

export function authUserFromProfile(email: string, profile: UserProfile): AuthUser {
  const normalized = normalizeEmail(email);
  return {
    id: userIdFromEmail(normalized),
    email: normalized,
    nickname: profile.nickname,
    avatarUrl: profile.hasAvatar
      ? avatarPublicPath(normalized, profile.avatarVersion)
      : null,
  };
}

/** Uppercase first character for avatar glyph. */
export function emailInitial(email: string): string {
  const local = emailLocalPart(email);
  const first = local.charAt(0);
  return first ? first.toUpperCase() : "?";
}

export type AvatarTone = {
  background: string;
  foreground: string;
};

/** RSVD palette tones safe for initial avatars (stable index via hash). */
export const AVATAR_TONES: AvatarTone[] = [
  { background: "var(--rsvd-brand)", foreground: "var(--rsvd-on-brand)" },
  { background: "var(--rsvd-brand-strong)", foreground: "var(--rsvd-on-brand)" },
  { background: "var(--rsvd-success)", foreground: "var(--rsvd-on-brand)" },
  { background: "var(--rsvd-danger)", foreground: "var(--rsvd-on-brand)" },
  { background: "var(--rsvd-accent)", foreground: "var(--rsvd-text)" },
  { background: "var(--rsvd-tint)", foreground: "var(--rsvd-brand)" },
];

export function avatarToneForEmail(email: string): AvatarTone {
  const key = normalizeEmail(email);
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
  }
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}
