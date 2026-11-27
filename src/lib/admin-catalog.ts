/**
 * Admin catalog in Redis: spaces + platform users.
 * Seeds 7 stores and 15 sample-grade users with random 단골 links once.
 */

import { buildSeedAdminSpaces } from "@/data/admin-spaces";
import { buildSeedSampleUsers } from "@/data/admin-users";
import { sampleAvatarForUserId } from "@/data/spaces";
import {
  adminSpaceReservationCount,
  createEmptyWeekSchedule,
  SPACE_MENU_IMAGES_MAX,
  SPACE_OTHER_IMAGES_MAX,
  syncAdminSpaceStats,
  type AdminSpace,
  type WeekdayKey,
  type WeekdaySchedule,
} from "@/domain/admin-space";
import {
  DEFAULT_PLATFORM_USER_GRADE,
  type AdminUser,
  type PlatformUserGrade,
} from "@/domain/admin-user";
import {
  defaultNickname,
  normalizeEmail,
  userIdFromEmail,
} from "@/domain/auth";
import {
  spaceRegularsToAvatarStack,
  type SpaceItem,
  type SpaceRegularMember,
} from "@/domain/space";
import { resolveUserRole } from "@/lib/admin";
import { processSpaceImageToWebp } from "@/lib/process-space-image";
import { getRedis, isRedisConfigured } from "@/lib/redis";
import {
  isStoredSpaceImageUrl,
  saveSpaceImageWebp,
} from "@/lib/space-image-store";

const SPACES_KEY = "rsvd:catalog:spaces";
const USERS_KEY = "rsvd:catalog:users";
/** Bump when seed shape / avatar-stack logic changes so Redis re-seeds. */
const SEEDED_KEY = "rsvd:catalog:seeded:v6";
/** One-time clear of seeded weekly hours across existing catalog spaces. */
const HOURS_CLEARED_KEY = "rsvd:catalog:hours-cleared:v1";
/** One-time migrate remote gallery URLs into stored WebP assets. */
const IMAGES_STORED_KEY = "rsvd:catalog:images-stored:v1";
const PROFILE_KEY_PREFIX = "rsvd:user:profile:";
const PASSWORD_KEY_PREFIX = "rsvd:user:password:";

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
    await ensureWeeklyHoursCleared();
    await ensureSpaceImagesStored();
    return;
  }

  const users = buildSeedSampleUsers(15);
  const spaces = attachRandomRegulars(buildSeedAdminSpaces(), users);

  await redis.set(USERS_KEY, users);
  await redis.set(SPACES_KEY, spaces);
  await redis.set(SEEDED_KEY, new Date().toISOString());
  await redis.set(HOURS_CLEARED_KEY, new Date().toISOString());
  await ensureSpaceImagesStored();
}

async function ensureWeeklyHoursCleared(): Promise<void> {
  if (!isRedisConfigured()) {
    return;
  }
  const redis = getRedis();
  const cleared = await redis.get<string>(HOURS_CLEARED_KEY);
  if (cleared) {
    return;
  }
  const spaces = (await redis.get<AdminSpace[]>(SPACES_KEY)) ?? [];
  const next = spaces.map((space) => ({
    ...space,
    weeklyHours: createEmptyWeekSchedule(),
  }));
  await redis.set(SPACES_KEY, next);
  await redis.set(HOURS_CLEARED_KEY, new Date().toISOString());
}

async function ingestRemoteImageUrl(url: string): Promise<string> {
  const trimmed = url.trim();
  if (!trimmed) {
    return "";
  }
  if (isStoredSpaceImageUrl(trimmed)) {
    return trimmed;
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const response = await fetch(trimmed, {
    headers: { Accept: "image/*" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`image-fetch-failed:${response.status}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  const webp = await processSpaceImageToWebp(bytes);
  const saved = await saveSpaceImageWebp(webp);
  return saved.url;
}

async function migrateSpaceImageFields(space: AdminSpace): Promise<AdminSpace> {
  const heroImage = space.heroImage
    ? await ingestRemoteImageUrl(space.heroImage)
    : "";
  const menuImages: string[] = [];
  for (const url of space.menuImages.slice(0, SPACE_MENU_IMAGES_MAX)) {
    const next = await ingestRemoteImageUrl(url);
    if (next) {
      menuImages.push(next);
    }
  }
  const otherImages: string[] = [];
  for (const url of space.otherImages.slice(0, SPACE_OTHER_IMAGES_MAX)) {
    const next = await ingestRemoteImageUrl(url);
    if (next) {
      otherImages.push(next);
    }
  }
  return {
    ...space,
    heroImage,
    menuImages,
    otherImages,
  };
}

function spaceNeedsImageMigration(space: AdminSpace): boolean {
  const urls = [
    space.heroImage,
    ...space.menuImages,
    ...space.otherImages,
  ].filter(Boolean);
  return urls.some(
    (url) => /^https?:\/\//i.test(url) && !isStoredSpaceImageUrl(url),
  );
}

async function ensureSpaceImagesStored(): Promise<void> {
  if (!isRedisConfigured()) {
    return;
  }
  const redis = getRedis();
  const done = await redis.get<string>(IMAGES_STORED_KEY);
  if (done) {
    return;
  }

  const spaces = (await redis.get<AdminSpace[]>(SPACES_KEY)) ?? [];
  let pendingRemote = false;
  const next = [...spaces];

  for (let index = 0; index < next.length; index += 1) {
    const space = next[index];
    if (!spaceNeedsImageMigration(space)) {
      continue;
    }
    try {
      const migrated = await migrateSpaceImageFields(space);
      next[index] = migrated;
      if (spaceNeedsImageMigration(migrated)) {
        pendingRemote = true;
      }
      // Persist per space so a serverless timeout can resume later.
      await redis.set(SPACES_KEY, next);
    } catch (error) {
      console.error("space image migrate failed", space.id, error);
      pendingRemote = true;
    }
  }

  if (!pendingRemote) {
    await redis.set(IMAGES_STORED_KEY, new Date().toISOString());
  }
}

export async function listCatalogSpaces(): Promise<AdminSpace[]> {
  await ensureAdminCatalogSeeded();
  if (!isRedisConfigured()) {
    return attachRandomRegulars(
      buildSeedAdminSpaces(),
      buildSeedSampleUsers(15),
    ).map(syncAdminSpaceStats);
  }
  await ensureWeeklyHoursCleared();
  await ensureSpaceImagesStored();
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

function normalizeImageFields(
  fields: AdminSpaceEditableFields,
): AdminSpaceEditableFields {
  const heroImage = fields.heroImage.trim();
  return {
    ...fields,
    heroImage,
    menuImages: fields.menuImages
      .map((url) => url.trim())
      .filter(Boolean)
      .slice(0, SPACE_MENU_IMAGES_MAX),
    otherImages: fields.otherImages
      .map((url) => url.trim())
      .filter(Boolean)
      .slice(0, SPACE_OTHER_IMAGES_MAX),
  };
}

export type UpdateSpaceActiveResult =
  | { ok: true; space: AdminSpace }
  | { ok: false; reason: "not-found" | "has-reservations" };

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
  if (
    current.active &&
    fields.active === false &&
    adminSpaceReservationCount(current) > 0
  ) {
    throw new Error("has-reservations");
  }

  const next = syncAdminSpaceStats({
    ...current,
    ...normalizeImageFields(fields),
    id: current.id,
  });
  const updated = [...spaces];
  updated[index] = next;
  await redis.set(SPACES_KEY, updated);
  return next;
}

export async function updateCatalogSpaceActive(
  id: string,
  active: boolean,
): Promise<UpdateSpaceActiveResult> {
  await ensureAdminCatalogSeeded();
  if (!isRedisConfigured()) {
    throw new Error("Catalog store is not configured.");
  }

  const redis = getRedis();
  const spaces = (await redis.get<AdminSpace[]>(SPACES_KEY)) ?? [];
  const index = spaces.findIndex((space) => space.id === id);
  if (index < 0) {
    return { ok: false, reason: "not-found" };
  }

  const current = syncAdminSpaceStats(spaces[index]);
  if (
    current.active &&
    !active &&
    adminSpaceReservationCount(current) > 0
  ) {
    return { ok: false, reason: "has-reservations" };
  }

  const next = syncAdminSpaceStats({
    ...current,
    active,
  });
  const updated = [...spaces];
  updated[index] = next;
  await redis.set(SPACES_KEY, updated);
  return { ok: true, space: next };
}

export async function createCatalogSpace(
  fields: AdminSpaceEditableFields,
): Promise<AdminSpace> {
  await ensureAdminCatalogSeeded();
  if (!isRedisConfigured()) {
    throw new Error("Catalog store is not configured.");
  }

  const redis = getRedis();
  const spaces = (await redis.get<AdminSpace[]>(SPACES_KEY)) ?? [];
  const id = `space-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
  const created = syncAdminSpaceStats({
    id,
    ...normalizeImageFields(fields),
    currentReservationCount: 0,
    weeklyHours: createEmptyWeekSchedule(),
    exceptions: [],
    regularUserIds: [],
    regularMembers: [],
    lastReservedAt: "",
    lastLikedAt: "",
  });
  await redis.set(SPACES_KEY, [...spaces, created]);
  return created;
}

export async function updateCatalogSpaceDayHours(
  id: string,
  day: WeekdayKey,
  schedule: WeekdaySchedule,
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
  const weeklyHours = {
    ...current.weeklyHours,
    [day]: {
      slots: schedule.slots.map((slot) => ({
        ...slot,
        extraBufferDays: 0,
      })),
    },
  };
  const next = syncAdminSpaceStats({
    ...current,
    weeklyHours,
  });
  const updated = [...spaces];
  updated[index] = next;
  await redis.set(SPACES_KEY, updated);
  return next;
}

export async function listCatalogUsers(): Promise<AdminUser[]> {
  if (!isRedisConfigured()) {
    return buildSeedSampleUsers(15);
  }
  // Avoid ensureAdminCatalogSeeded here — image migration can block/fail user listing.
  await ensureUsersCatalogReady();
  await backfillCatalogUsersFromAuthStore();
  const users = await getRedis().get<AdminUser[]>(USERS_KEY);
  return sortCatalogUsers(users ?? []);
}

export async function saveCatalogUsers(users: AdminUser[]): Promise<void> {
  await getRedis().set(USERS_KEY, users);
}

function onboardGradeForEmail(email: string): PlatformUserGrade {
  return resolveUserRole(email) === "admin"
    ? "admin"
    : DEFAULT_PLATFORM_USER_GRADE;
}

function sortCatalogUsers(users: AdminUser[]): AdminUser[] {
  return [...users].sort((a, b) => {
    if (a.grade === "admin" && b.grade !== "admin") {
      return -1;
    }
    if (b.grade === "admin" && a.grade !== "admin") {
      return 1;
    }
    const aJoined = Date.parse(a.joinedAt) || 0;
    const bJoined = Date.parse(b.joinedAt) || 0;
    if (aJoined !== bJoined) {
      return bJoined - aJoined;
    }
    return a.email.localeCompare(b.email);
  });
}

/** Ensure users list exists without running space image migrations. */
async function ensureUsersCatalogReady(): Promise<void> {
  if (!isRedisConfigured()) {
    return;
  }
  const redis = getRedis();
  const existing = await redis.get<AdminUser[]>(USERS_KEY);
  if (existing) {
    return;
  }
  const seeded = await redis.get<string>(SEEDED_KEY);
  if (!seeded) {
    await ensureAdminCatalogSeeded();
    return;
  }
  await redis.set(USERS_KEY, buildSeedSampleUsers(15));
}

type StoredAuthProfile = {
  nickname?: string;
  phone?: string | null;
};

/**
 * Merge Redis auth profiles/passwords into the admin user list.
 * Fixes accounts onboarded before catalog sync (or when sync was blocked).
 */
async function backfillCatalogUsersFromAuthStore(): Promise<void> {
  if (!isRedisConfigured()) {
    return;
  }
  const redis = getRedis();
  const profileKeys =
    ((await redis.keys(`${PROFILE_KEY_PREFIX}*`)) as string[] | null) ?? [];
  const passwordKeys =
    ((await redis.keys(`${PASSWORD_KEY_PREFIX}*`)) as string[] | null) ?? [];

  const emails = new Set<string>();
  for (const key of profileKeys) {
    const email = normalizeEmail(key.slice(PROFILE_KEY_PREFIX.length));
    if (email) {
      emails.add(email);
    }
  }
  for (const key of passwordKeys) {
    const email = normalizeEmail(key.slice(PASSWORD_KEY_PREFIX.length));
    if (email) {
      emails.add(email);
    }
  }
  if (emails.size === 0) {
    return;
  }

  for (const email of emails) {
    const stored = await redis.get<StoredAuthProfile>(
      `${PROFILE_KEY_PREFIX}${email}`,
    );
    await syncOnboardedCatalogUser({
      email,
      nickname:
        typeof stored?.nickname === "string" && stored.nickname.trim()
          ? stored.nickname
          : defaultNickname(email),
      phone:
        typeof stored?.phone === "string" && stored.phone
          ? stored.phone
          : null,
    });
  }
}

/**
 * Ensure an onboarded auth account appears in the admin user list.
 * New accounts default to user3; ADMIN_EMAIL accounts use admin.
 */
export async function syncOnboardedCatalogUser(input: {
  email: string;
  nickname: string;
  phone: string | null;
}): Promise<void> {
  if (!isRedisConfigured()) {
    return;
  }
  await ensureUsersCatalogReady();

  const redis = getRedis();
  const email = normalizeEmail(input.email);
  const users = (await redis.get<AdminUser[]>(USERS_KEY)) ?? [];
  const index = users.findIndex(
    (user) => normalizeEmail(user.email) === email,
  );
  const desiredGrade = onboardGradeForEmail(email);
  const nickname = input.nickname.trim() || email;
  const phone = input.phone?.trim() || "";

  if (index >= 0) {
    const current = users[index];
    let grade = current.grade;
    if (desiredGrade === "admin") {
      grade = "admin";
    } else if (grade === "sample") {
      grade = desiredGrade;
    }
    users[index] = {
      ...current,
      email,
      nickname,
      phone,
      grade,
    };
  } else {
    users.push({
      id: userIdFromEmail(email),
      email,
      joinedAt: new Date().toISOString(),
      nickname,
      phone,
      grade: desiredGrade,
    });
  }

  await redis.set(USERS_KEY, users);
}

export function adminSpaceToPublicItem(space: AdminSpace): SpaceItem {
  // List thumbnail = hero; detail carousel = hero → menu → other.
  const images = [
    space.heroImage,
    ...space.menuImages,
    ...space.otherImages,
  ]
    .map((url) => url.trim())
    .filter(Boolean);
  const regularMembers = normalizeRegularMembers(space);
  const recentReservers = spaceRegularsToAvatarStack(regularMembers);

  return {
    id: space.id,
    name: space.name,
    address: space.address,
    tagline: (space.notices.join("\n").trim().slice(0, 48) || space.name),
    description: space.notices.join("\n"),
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
  // Auth-agnostic: inactive stores stay hidden for guests and logged-in users.
  return spaces
    .filter((space) => space.active === true)
    .map(adminSpaceToPublicItem);
}

export async function getPublicSpaceById(
  id: string,
): Promise<SpaceItem | null> {
  const space = await getCatalogSpaceById(id);
  if (!space || space.active !== true) {
    return null;
  }
  return adminSpaceToPublicItem(space);
}
