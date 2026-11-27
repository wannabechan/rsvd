/**
 * Space gallery images in Redis (WebP bytes as base64).
 */

import { getRedis, isRedisConfigured } from "@/lib/redis";

const IMAGE_KEY_PREFIX = "rsvd:space-image:";

export function isSpaceImageStoreConfigured(): boolean {
  return isRedisConfigured();
}

export function spaceImagePublicPath(imageId: string): string {
  return `/api/space-images/${encodeURIComponent(imageId)}`;
}

export function parseSpaceImageIdFromPath(url: string): string | null {
  const match = /^\/api\/space-images\/([^/?#]+)$/.exec(url.trim());
  if (!match) {
    return null;
  }
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export function isStoredSpaceImageUrl(url: string): boolean {
  return parseSpaceImageIdFromPath(url) !== null;
}

function imageKey(imageId: string): string {
  return `${IMAGE_KEY_PREFIX}${imageId}`;
}

function createImageId(): string {
  return `img_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function saveSpaceImageWebp(
  webpBytes: Uint8Array,
): Promise<{ id: string; url: string }> {
  const id = createImageId();
  const base64 = Buffer.from(webpBytes).toString("base64");
  await getRedis().set(imageKey(id), base64);
  return { id, url: spaceImagePublicPath(id) };
}

export async function getSpaceImageWebpBytes(
  imageId: string,
): Promise<Uint8Array | null> {
  const base64 = await getRedis().get<string>(imageKey(imageId));
  if (!base64) {
    return null;
  }
  return new Uint8Array(Buffer.from(base64, "base64"));
}

export async function deleteSpaceImage(imageId: string): Promise<void> {
  await getRedis().del(imageKey(imageId));
}
