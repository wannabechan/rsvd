/**
 * Server-only user credential + profile store (Upstash Redis on Vercel).
 * Env: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 * (Vercel Marketplace also injects KV_REST_API_URL / KV_REST_API_TOKEN)
 */

import { Redis } from "@upstash/redis";
import {
  authUserFromProfile,
  defaultNickname,
  normalizeEmail,
  normalizeNickname,
  type AuthUser,
  type UserProfile,
} from "@/domain/auth";

const PASSWORD_KEY_PREFIX = "rsvd:user:password:";
const PROFILE_KEY_PREFIX = "rsvd:user:profile:";
const AVATAR_KEY_PREFIX = "rsvd:user:avatar:";

type StoredProfile = {
  nickname: string;
  hasAvatar: boolean;
  avatarVersion: number;
};

let redisClient: Redis | null | undefined;

function getRedis(): Redis {
  if (redisClient) {
    return redisClient;
  }

  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Missing Redis credentials. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (or KV_REST_API_* from Vercel Upstash).",
    );
  }

  redisClient = new Redis({ url, token });
  return redisClient;
}

export function isUserStoreConfigured(): boolean {
  return Boolean(
    (process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL) &&
      (process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN),
  );
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
      hasAvatar: false,
      avatarVersion: 0,
    };
  }
  return {
    nickname: stored.nickname || defaultNickname(email),
    hasAvatar: Boolean(stored.hasAvatar),
    avatarVersion: Number(stored.avatarVersion) || 0,
  };
}

export async function getUserProfile(email: string): Promise<UserProfile> {
  const stored = await getRedis().get<StoredProfile>(profileKey(email));
  return toUserProfile(email, stored);
}

export async function ensureUserProfile(email: string): Promise<UserProfile> {
  const normalized = normalizeEmail(email);
  const existing = await getRedis().get<StoredProfile>(profileKey(normalized));
  if (existing) {
    return toUserProfile(normalized, existing);
  }

  const profile: StoredProfile = {
    nickname: defaultNickname(normalized),
    hasAvatar: false,
    avatarVersion: 0,
  };
  await getRedis().set(profileKey(normalized), profile);
  return toUserProfile(normalized, profile);
}

export async function buildAuthUser(email: string): Promise<AuthUser> {
  const profile = await ensureUserProfile(email);
  return authUserFromProfile(email, profile);
}

export async function updateNickname(
  email: string,
  nickname: string,
): Promise<UserProfile> {
  const normalized = normalizeEmail(email);
  const current = await ensureUserProfile(normalized);
  const next: StoredProfile = {
    nickname: normalizeNickname(nickname, normalized),
    hasAvatar: current.hasAvatar,
    avatarVersion: current.avatarVersion,
  };
  await getRedis().set(profileKey(normalized), next);
  return toUserProfile(normalized, next);
}

export async function saveAvatarWebp(
  email: string,
  webpBytes: Uint8Array,
): Promise<UserProfile> {
  const normalized = normalizeEmail(email);
  const current = await ensureUserProfile(normalized);
  const version = current.avatarVersion + 1;
  const base64 = Buffer.from(webpBytes).toString("base64");
  await getRedis().set(avatarKey(normalized), base64);
  const next: StoredProfile = {
    nickname: current.nickname,
    hasAvatar: true,
    avatarVersion: version,
  };
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
  const next: StoredProfile = {
    nickname: current.nickname,
    hasAvatar: false,
    avatarVersion: current.avatarVersion + 1,
  };
  await getRedis().set(profileKey(normalized), next);
  return toUserProfile(normalized, next);
}
