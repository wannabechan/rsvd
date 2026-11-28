/**
 * Server-only user credential + profile store (Upstash Redis on Vercel).
 */

import {
  authUserFromProfile,
  defaultNickname,
  normalizeEmail,
  normalizeNickname,
  normalizePhone,
  type AuthUser,
  type UserProfile,
} from "@/domain/auth";
import { normalizeInterestRegions } from "@/domain/interest-region";
import { syncOnboardedCatalogUser } from "@/lib/admin-catalog";
import { isEmailMatchedSpaceCandidate } from "@/lib/admin-space-candidates";
import { resolveUserRole } from "@/lib/admin";
import { getRedis, isRedisConfigured } from "@/lib/redis";

const PASSWORD_KEY_PREFIX = "rsvd:user:password:";
const PROFILE_KEY_PREFIX = "rsvd:user:profile:";
const AVATAR_KEY_PREFIX = "rsvd:user:avatar:";

type StoredProfile = {
  nickname: string;
  phone: string | null;
  interestRegions?: string[];
  ownerVerified?: boolean;
  hasAvatar: boolean;
  avatarVersion: number;
};

export function isUserStoreConfigured(): boolean {
  return isRedisConfigured();
}

function passwordKey(email: string): string {
  return `${PASSWORD_KEY_PREFIX}${normalizeEmail(email)}`;
}

function profileKey(email: string): string {
  return `${PROFILE_KEY_PREFIX}${normalizeEmail(email)}`;
}

function avatarKey(email: string): string {
  return `${AVATAR_KEY_PREFIX}${normalizeEmail(email)}`;
}

export async function getPasswordHash(email: string): Promise<string | null> {
  const value = await getRedis().get<string>(passwordKey(email));
  return value ?? null;
}

export async function hasPasswordForEmail(email: string): Promise<boolean> {
  const hash = await getPasswordHash(email);
  return Boolean(hash);
}

export async function setPasswordHash(
  email: string,
  passwordHash: string,
): Promise<void> {
  await getRedis().set(passwordKey(email), passwordHash);
}

function toUserProfile(email: string, stored: StoredProfile | null): UserProfile {
  if (!stored) {
    return {
      nickname: defaultNickname(email),
      phone: null,
      interestRegions: [],
      ownerVerified: false,
      hasAvatar: false,
      avatarVersion: 0,
    };
  }
  const phone =
    typeof stored.phone === "string" && stored.phone
      ? normalizePhone(stored.phone)
      : null;
  return {
    nickname: stored.nickname || defaultNickname(email),
    phone: phone || null,
    interestRegions: normalizeInterestRegions(stored.interestRegions),
    ownerVerified: Boolean(stored.ownerVerified),
    hasAvatar: Boolean(stored.hasAvatar),
    avatarVersion: Number(stored.avatarVersion) || 0,
  };
}

function toStoredProfile(profile: UserProfile): StoredProfile {
  return {
    nickname: profile.nickname,
    phone: profile.phone,
    interestRegions: normalizeInterestRegions(profile.interestRegions),
    ownerVerified: Boolean(profile.ownerVerified),
    hasAvatar: profile.hasAvatar,
    avatarVersion: profile.avatarVersion,
  };
}

export async function getUserProfile(email: string): Promise<UserProfile> {
  const stored = await getRedis().get<StoredProfile>(profileKey(email));
  return toUserProfile(email, stored);
}

async function syncCatalogListing(
  email: string,
  profile: UserProfile,
): Promise<void> {
  try {
    await syncOnboardedCatalogUser({
      email,
      nickname: profile.nickname,
      phone: profile.phone,
    });
  } catch (error) {
    console.error("catalog user sync failed", email, error);
  }
}

export async function ensureUserProfile(email: string): Promise<UserProfile> {
  const normalized = normalizeEmail(email);
  const existing = await getRedis().get<StoredProfile>(profileKey(normalized));
  if (existing) {
    const profile = toUserProfile(normalized, existing);
    await syncCatalogListing(normalized, profile);
    return profile;
  }

  const profile: StoredProfile = {
    nickname: defaultNickname(normalized),
    phone: null,
    interestRegions: [],
    ownerVerified: false,
    hasAvatar: false,
    avatarVersion: 0,
  };
  await getRedis().set(profileKey(normalized), profile);
  const next = toUserProfile(normalized, profile);
  await syncCatalogListing(normalized, next);
  return next;
}

export async function buildAuthUser(email: string): Promise<AuthUser> {
  const profile = await ensureUserProfile(email);
  const canOwnerVerify = await isEmailMatchedSpaceCandidate(email);
  return authUserFromProfile(email, profile, resolveUserRole(email), {
    canOwnerVerify,
  });
}

export async function markOwnerVerified(email: string): Promise<UserProfile> {
  const normalized = normalizeEmail(email);
  const current = await ensureUserProfile(normalized);
  const next = toStoredProfile({
    ...current,
    ownerVerified: true,
  });
  await getRedis().set(profileKey(normalized), next);
  const profile = toUserProfile(normalized, next);
  await syncCatalogListing(normalized, profile);
  return profile;
}

export async function updateNickname(
  email: string,
  nickname: string,
): Promise<UserProfile> {
  const normalized = normalizeEmail(email);
  const current = await ensureUserProfile(normalized);
  const next = toStoredProfile({
    ...current,
    nickname: normalizeNickname(nickname, normalized),
  });
  await getRedis().set(profileKey(normalized), next);
  const profile = toUserProfile(normalized, next);
  await syncCatalogListing(normalized, profile);
  return profile;
}

export async function updatePhone(
  email: string,
  phone: string,
): Promise<UserProfile> {
  const normalized = normalizeEmail(email);
  const current = await ensureUserProfile(normalized);
  const next = toStoredProfile({
    ...current,
    phone: normalizePhone(phone),
  });
  await getRedis().set(profileKey(normalized), next);
  const profile = toUserProfile(normalized, next);
  await syncCatalogListing(normalized, profile);
  return profile;
}

export async function clearPhone(email: string): Promise<UserProfile> {
  const normalized = normalizeEmail(email);
  const current = await ensureUserProfile(normalized);
  const next = toStoredProfile({
    ...current,
    phone: null,
  });
  await getRedis().set(profileKey(normalized), next);
  const profile = toUserProfile(normalized, next);
  await syncCatalogListing(normalized, profile);
  return profile;
}

export async function updateInterestRegions(
  email: string,
  interestRegions: string[],
): Promise<UserProfile> {
  const normalized = normalizeEmail(email);
  const current = await ensureUserProfile(normalized);
  const next = toStoredProfile({
    ...current,
    interestRegions: normalizeInterestRegions(interestRegions),
  });
  await getRedis().set(profileKey(normalized), next);
  const profile = toUserProfile(normalized, next);
  await syncCatalogListing(normalized, profile);
  return profile;
}

export async function saveAvatarWebp(
  email: string,
  webpBytes: Uint8Array,
): Promise<UserProfile> {
  const normalized = normalizeEmail(email);
  const current = await ensureUserProfile(normalized);
  const next = toStoredProfile({
    ...current,
    hasAvatar: true,
    avatarVersion: current.avatarVersion + 1,
  });
  const base64 = Buffer.from(webpBytes).toString("base64");
  await getRedis().set(avatarKey(normalized), base64);
  await getRedis().set(profileKey(normalized), next);
  return toUserProfile(normalized, next);
}

export async function getAvatarWebpBytes(
  email: string,
): Promise<Uint8Array | null> {
  const base64 = await getRedis().get<string>(avatarKey(email));
  if (!base64) {
    return null;
  }
  return new Uint8Array(Buffer.from(base64, "base64"));
}

export async function clearAvatar(email: string): Promise<UserProfile> {
  const normalized = normalizeEmail(email);
  const current = await ensureUserProfile(normalized);
  await getRedis().del(avatarKey(normalized));
  const next = toStoredProfile({
    ...current,
    hasAvatar: false,
    avatarVersion: current.avatarVersion + 1,
  });
  await getRedis().set(profileKey(normalized), next);
  return toUserProfile(normalized, next);
}
