/**
 * Server-only user credential store (Upstash Redis on Vercel).
 * Env: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 * (Vercel Marketplace also injects KV_REST_API_URL / KV_REST_API_TOKEN)
 */

import { Redis } from "@upstash/redis";
import { normalizeEmail } from "@/domain/auth";

const PASSWORD_KEY_PREFIX = "rsvd:user:password:";

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
