/**
 * Admin catalog in Redis: spaces + platform users.
 * Seeds 7 stores and 15 sample-grade users with random 단골 links once.
 */

import { buildSeedAdminSpaces } from "@/data/admin-spaces";
import { buildSeedSampleUsers } from "@/data/admin-users";
import { sampleAvatarForUserId } from "@/data/spaces";
import {
  syncAdminSpaceStats,
  type AdminSpace,
} from "@/domain/admin-space";
import type { AdminUser } from "@/domain/admin-user";
import {
  spaceRegularsToAvatarStack,
  type SpaceItem,
  type SpaceRegularMember,
} from "@/domain/space";
import { getRedis, isRedisConfigured } from "@/lib/redis";

const SPACES_KEY = "rsvd:catalog:spaces";
const USERS_KEY = "rsvd:catalog:users";
/** Bump when seed shape / avatar-stack logic changes so Redis re-seeds. */
const SEEDED_KEY = "rsvd:catalog:seeded:v6";

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function maxIsoTimestamp(values: string[]): string {
  let best = "";
  let bestMs = 0;
  for (const value of values) {
    const ms = Date.parse(value) || 0;
    if (ms > bestMs) {
      bestMs = ms;
      best = value;
    }
  }
  return best;
}

function attachRandomRegulars(
  spaces: AdminSpace[],
  users: AdminUser[],
): AdminSpace[] {
  const sampleUsers = users.filter((user) => user.grade === "sample");
  const rand = mulberry32(20261127);
  const now = Date.parse("2025-11-27T18:00:00.000Z");

  return spaces.map((space, spaceIndex) => {
    const count = 1 + Math.floor(rand() * Math.min(8, sampleUsers.length));
    const shuffled = [...sampleUsers].sort(() => rand() - 0.5);
    const picked = shuffled.slice(0, count);

    const regularMembers: SpaceRegularMember[] = picked.map((user, memberIndex) => {
      const likedAt = new Date(
        now -
          spaceIndex * 3_600_000 -
          memberIndex * 900_000 -
          Math.floor(rand() * 600_000),
      ).toISOString();
      return {
        userId: user.id,
        likedAt,
        // No real reservation history yet — keep empty until bookings exist.
        lastReservedAt: "",
        imageUrl: sampleAvatarForUserId(user.id),
      };
    });

    const regularUserIds = regularMembers.map((member) => member.userId);
    const lastLikedAt = maxIsoTimestamp(
      regularMembers.map((member) => member.likedAt),
    );

    return {
      ...space,
      regularUserIds,
      regularMembers,
      lastReservedAt: "",
      lastLikedAt,
      currentReservationCount: 0,
    };
  });
}

function normalizeRegularMembers(space: AdminSpace): SpaceRegularMember[] {
  if (space.regularMembers?.length) {
    return space.regularMembers;
  }
  // Legacy seed rows: ids only — synthesize members so avatar count still matches likes.
  return (space.regularUserIds ?? []).map((userId, index) => ({
    userId,
    likedAt: space.lastLikedAt || new Date(0).toISOString(),
    lastReservedAt: index === 0 ? space.lastReservedAt || "" : "",
    imageUrl: sampleAvatarForUserId(userId),
  }));
}

export async function ensureAdminCatalogSeeded(): Promise<void> {
  if (!isRedisConfigured()) {
    return;
  }
  const redis = getRedis();
  const seeded = await redis.get<string>(SEEDED_KEY);
  if (seeded) {
    return;
  }

  const users = buildSeedSampleUsers(15);
  const spaces = attachRandomRegulars(buildSeedAdminSpaces(), users);

  await redis.set(USERS_KEY, users);
  await redis.set(SPACES_KEY, spaces);
  await redis.set(SEEDED_KEY, new Date().toISOString());
}

export async function listCatalogSpaces(): Promise<AdminSpace[]> {
  await ensureAdminCatalogSeeded();
  if (!isRedisConfigured()) {
    return attachRandomRegulars(
      buildSeedAdminSpaces(),
      buildSeedSampleUsers(15),
    ).map(syncAdminSpaceStats);
  }
  const spaces = await getRedis().get<AdminSpace[]>(SPACES_KEY);
  return (spaces ?? []).map(syncAdminSpaceStats);
}

export async function getCatalogSpaceById(
  id: string,
): Promise<AdminSpace | null> {
  const spaces = await listCatalogSpaces();
  return spaces.find((space) => space.id === id) ?? null;
}

export async function saveCatalogSpaces(spaces: AdminSpace[]): Promise<void> {
  await getRedis().set(SPACES_KEY, spaces);
}

export type AdminSpaceEditableFields = Pick<
  AdminSpace,
  | "name"
  | "adminEmail"
  | "notices"
  | "address"
  | "contact"
  | "heroImage"
  | "menuImages"
  | "otherImages"
  | "bookingBufferDays"
  | "maxBookingDays"
  | "minPartySize"
  | "maxPartySize"
  | "active"
>;

export async function updateCatalogSpace(
  id: string,
  fields: AdminSpaceEditableFields,
): Promise<AdminSpace | null> {
  await ensureAdminCatalogSeeded();
  if (!isRedisConfigured()) {
    throw new Error("Catalog store is not configured.");
  }

  const redis = getRedis();
  const spaces = (await redis.get<AdminSpace[]>(SPACES_KEY)) ?? [];
  const index = spaces.findIndex((space) => space.id === id);
  if (index < 0) {
    return null;
  }

  const current = syncAdminSpaceStats(spaces[index]);
  const next = syncAdminSpaceStats({
    ...current,
    ...fields,
    id: current.id,
  });
  const updated = [...spaces];
  updated[index] = next;
  await redis.set(SPACES_KEY, updated);
  return next;
}

export async function listCatalogUsers(): Promise<AdminUser[]> {
  await ensureAdminCatalogSeeded();
  if (!isRedisConfigured()) {
    return buildSeedSampleUsers(15);
  }
  const users = await getRedis().get<AdminUser[]>(USERS_KEY);
  return users ?? [];
}

export async function saveCatalogUsers(users: AdminUser[]): Promise<void> {
  await getRedis().set(USERS_KEY, users);
}

export function adminSpaceToPublicItem(space: AdminSpace): SpaceItem {
  const images = [
    space.heroImage,
    ...space.menuImages,
    ...space.otherImages,
  ].filter(Boolean);
  const regularMembers = normalizeRegularMembers(space);
  const recentReservers = spaceRegularsToAvatarStack(regularMembers);

  return {
    id: space.id,
    name: space.name,
    address: space.address,
    tagline: space.notices[0]?.slice(0, 48) ?? space.name,
    description: space.notices.join("\n\n"),
    images,
    contact: space.contact,
    onlineLink: "",
    totalLikeCount: regularMembers.length,
    lastReservedAt: space.lastReservedAt || "",
    lastLikedAt: space.lastLikedAt || "",
    recentReservers,
    notice: space.notices,
  };
}

export async function listPublicSpaces(): Promise<SpaceItem[]> {
  const spaces = await listCatalogSpaces();
  return spaces
    .filter((space) => space.active)
    .map(adminSpaceToPublicItem);
}

export async function getPublicSpaceById(
  id: string,
): Promise<SpaceItem | null> {
  const space = await getCatalogSpaceById(id);
  if (!space || !space.active) {
    return null;
  }
  return adminSpaceToPublicItem(space);
}
