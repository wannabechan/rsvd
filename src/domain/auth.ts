/**
 * Platform-agnostic auth domain.
 * Keep free of React/Next/DOM so native shells can reuse the same rules.
 */

export type AuthUser = {
  id: string;
  email: string;
};

export type LoginStep = "email" | "code" | "password" | "password-setup";

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
