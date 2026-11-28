/**
 * Platform-agnostic auth domain.
 * Keep free of React/Next/DOM so native shells can reuse the same rules.
 */

/** Highest grade when email matches server ADMIN_EMAIL. */
export type UserRole = "admin" | "member";

export type AuthUser = {
  id: string;
  email: string;
  /** Display name; defaults to email local-part. */
  nickname: string;
  /** Verified mobile number digits, or null when not verified. */
  phone: string | null;
  /** Interest regions labeled to 구 (or 시/군 leaf); max 5. */
  interestRegions: string[];
  /** Completed 사장님 인증 with a space-candidate verify code. */
  ownerVerified: boolean;
  /** Email is matched on a space-candidate (eligible for 사장님인증). */
  canOwnerVerify: boolean;
  /** Public avatar image URL, or null for letter+tone fallback. */
  avatarUrl: string | null;
  role: UserRole;
};

export type UserProfile = {
  nickname: string;
  /** Verified mobile number (digits only), or null. */
  phone: string | null;
  /** Interest regions labeled to 구 (or 시/군 leaf); max 5. */
  interestRegions: string[];
  /** Completed 사장님 인증 with a space-candidate verify code. */
  ownerVerified: boolean;
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

/** Digits only from free-form phone input. */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Korean mobile: 010/011/016/017/018/019 + 7–8 digits. */
export function isValidPhone(phone: string): boolean {
  return /^01[016789]\d{7,8}$/.test(normalizePhone(phone));
}

/** Display form: 010-1234-5678 (or 010-123-4567 for 10-digit). */
export function formatPhoneDisplay(phone: string): string {
  const digits = normalizePhone(phone);
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return digits;
}

/** SMS body for phone verification. */
export function phoneVerificationSmsBody(code: string): string {
  return `애정하는 단골 예약 rsvd. 연락처 인증번호 ${code.trim()}`;
}

export function avatarPublicPath(email: string, version: number): string {
  return `/api/profile/avatar?e=${encodeURIComponent(normalizeEmail(email))}&v=${version}`;
}

export function isAdminEmailAddress(
  email: string,
  adminEmail: string | null | undefined,
): boolean {
  if (!adminEmail?.trim()) {
    return false;
  }
  return normalizeEmail(email) === normalizeEmail(adminEmail);
}

export function authUserFromProfile(
  email: string,
  profile: UserProfile,
  role: UserRole = "member",
  options?: { canOwnerVerify?: boolean },
): AuthUser {
  const normalized = normalizeEmail(email);
  const ownerVerified = Boolean(profile.ownerVerified);
  return {
    id: userIdFromEmail(normalized),
    email: normalized,
    nickname: profile.nickname,
    phone: profile.phone ? normalizePhone(profile.phone) : null,
    interestRegions: Array.isArray(profile.interestRegions)
      ? profile.interestRegions
      : [],
    ownerVerified,
    canOwnerVerify: Boolean(options?.canOwnerVerify) || ownerVerified,
    avatarUrl: profile.hasAvatar
      ? avatarPublicPath(normalized, profile.avatarVersion)
      : null,
    role,
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
