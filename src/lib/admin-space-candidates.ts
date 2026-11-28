/**
 * Admin space candidates store (Redis).
 */

import { normalizeEmail } from "@/domain/auth";
import {
  candidateHandlesMatch,
  candidateRequestCount,
  createSpaceCandidateId,
  isSpaceCandidateChannel,
  isVerifyCodeActive,
  normalizeCandidateHandle,
  withFreshVerifyCode,
  type AdminSpaceCandidate,
  type SpaceCandidateChannel,
} from "@/domain/admin-space-candidate";
import { ensureCatalogSpaceForCandidate } from "@/lib/admin-catalog";
import { getRedis, isRedisConfigured } from "@/lib/redis";

const CANDIDATES_KEY = "rsvd:catalog:space-candidates:v1";
/** Same prefix as user-store — read-only check to avoid circular imports. */
const PROFILE_KEY_PREFIX = "rsvd:user:profile:";

function normalizeCandidate(row: AdminSpaceCandidate): AdminSpaceCandidate {
  return withFreshVerifyCode({
    ...row,
    email: typeof row.email === "string" ? row.email : "",
    verifyCode: typeof row.verifyCode === "string" ? row.verifyCode : "",
    verifyCodeExpiresAt:
      typeof row.verifyCodeExpiresAt === "string" ? row.verifyCodeExpiresAt : "",
    requestCount: candidateRequestCount(row),
    registrationComplete: Boolean(row.registrationComplete),
    spaceId: typeof row.spaceId === "string" ? row.spaceId : "",
  });
}

function asCompletedCandidate(row: AdminSpaceCandidate): AdminSpaceCandidate {
  return normalizeCandidate({
    ...row,
    verifyCode: "",
    verifyCodeExpiresAt: "",
    registrationComplete: true,
  });
}

async function isOwnerVerifiedEmail(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return false;
  }
  const stored = await getRedis().get<{ ownerVerified?: boolean }>(
    `${PROFILE_KEY_PREFIX}${normalized}`,
  );
  return Boolean(stored?.ownerVerified);
}

/**
 * If the matched account already finished 사장님 인증, force complete state
 * (repairs lost updates from concurrent admin code saves).
 */
async function reconcileOwnerVerifiedRows(
  rows: AdminSpaceCandidate[],
): Promise<{ rows: AdminSpaceCandidate[]; changed: boolean }> {
  const emails = [
    ...new Set(
      rows
        .map((row) => normalizeEmail(row.email))
        .filter(Boolean),
    ),
  ];
  const verified = new Set<string>();
  await Promise.all(
    emails.map(async (email) => {
      if (await isOwnerVerifiedEmail(email)) {
        verified.add(email);
      }
    }),
  );
  if (verified.size === 0) {
    return { rows: rows.map(normalizeCandidate), changed: false };
  }

  let changed = false;
  const next = rows.map((row) => {
    const normalized = normalizeCandidate(row);
    const email = normalizeEmail(normalized.email);
    if (!email || !verified.has(email)) {
      return normalized;
    }
    if (
      normalized.registrationComplete &&
      !normalized.verifyCode &&
      !normalized.verifyCodeExpiresAt
    ) {
      return normalized;
    }
    changed = true;
    return asCompletedCandidate(normalized);
  });
  return { rows: next, changed };
}

/**
 * For registration-complete candidates, ensure a linked inactive catalog space.
 * Idempotent via spaceId / invite+email match.
 */
async function ensureSpacesForCompletedCandidates(
  rows: AdminSpaceCandidate[],
): Promise<{ rows: AdminSpaceCandidate[]; changed: boolean }> {
  let changed = false;
  const next: AdminSpaceCandidate[] = [];

  for (const row of rows) {
    const normalized = normalizeCandidate(row);
    if (!normalized.registrationComplete || !normalizeEmail(normalized.email)) {
      next.push(normalized);
      continue;
    }

    try {
      const space = await ensureCatalogSpaceForCandidate({
        email: normalized.email,
        channel: normalized.channel,
        handle: normalized.handle,
        spaceId: normalized.spaceId || undefined,
      });
      if (normalized.spaceId !== space.id) {
        changed = true;
        next.push({ ...normalized, spaceId: space.id });
      } else {
        next.push(normalized);
      }
    } catch (error) {
      console.error("ensure space for candidate failed", normalized.id, error);
      next.push(normalized);
    }
  }

  return { rows: next, changed };
}

export async function listSpaceCandidates(): Promise<AdminSpaceCandidate[]> {
  if (!isRedisConfigured()) {
    return [];
  }
  const redis = getRedis();
  const rows = (await redis.get<AdminSpaceCandidate[]>(CANDIDATES_KEY)) ?? [];
  const reconciled = await reconcileOwnerVerifiedRows(rows);
  const ensured = await ensureSpacesForCompletedCandidates(reconciled.rows);
  if (reconciled.changed || ensured.changed) {
    await redis.set(CANDIDATES_KEY, ensured.rows);
  }
  return sortCandidates(ensured.rows.map(normalizeCandidate));
}

export async function findSpaceCandidate(
  channel: string,
  handle: string,
): Promise<AdminSpaceCandidate | null> {
  if (!isRedisConfigured()) {
    return null;
  }
  if (!isSpaceCandidateChannel(channel)) {
    return null;
  }
  const normalizedHandle = normalizeCandidateHandle(handle);
  if (!normalizedHandle) {
    return null;
  }
  const rows = (await getRedis().get<AdminSpaceCandidate[]>(CANDIDATES_KEY)) ?? [];
  const found = rows.find(
    (row) =>
      row.channel === channel &&
      candidateHandlesMatch(row.handle, normalizedHandle),
  );
  return found ? normalizeCandidate(found) : null;
}

export async function createSpaceCandidate(input: {
  channel: string;
  handle: string;
}): Promise<AdminSpaceCandidate> {
  if (!isRedisConfigured()) {
    throw new Error("Catalog store is not configured.");
  }

  const handle = normalizeCandidateHandle(input.handle);
  if (!handle) {
    throw new Error("handle-required");
  }
  if (!isSpaceCandidateChannel(input.channel)) {
    throw new Error("channel-invalid");
  }

  const channel: SpaceCandidateChannel = input.channel;
  const candidate: AdminSpaceCandidate = {
    id: createSpaceCandidateId(),
    channel,
    handle,
    appliedAt: new Date().toISOString(),
    email: "",
    verifyCode: "",
    verifyCodeExpiresAt: "",
    requestCount: 1,
    registrationComplete: false,
    spaceId: "",
  };

  const redis = getRedis();
  const current = (await redis.get<AdminSpaceCandidate[]>(CANDIDATES_KEY)) ?? [];
  await redis.set(CANDIDATES_KEY, [candidate, ...current.map(normalizeCandidate)]);
  return candidate;
}

export async function incrementSpaceCandidateRequest(input: {
  channel: string;
  handle: string;
}): Promise<AdminSpaceCandidate | null> {
  if (!isRedisConfigured()) {
    throw new Error("Catalog store is not configured.");
  }
  if (!isSpaceCandidateChannel(input.channel)) {
    throw new Error("channel-invalid");
  }
  const handle = normalizeCandidateHandle(input.handle);
  if (!handle) {
    throw new Error("handle-required");
  }

  const redis = getRedis();
  const current = (await redis.get<AdminSpaceCandidate[]>(CANDIDATES_KEY)) ?? [];
  const index = current.findIndex(
    (row) =>
      row.channel === input.channel &&
      candidateHandlesMatch(row.handle, handle),
  );
  if (index < 0) {
    return null;
  }

  const existing = normalizeCandidate(current[index]);
  const next: AdminSpaceCandidate = {
    ...existing,
    requestCount: existing.requestCount + 1,
  };
  const updated = [...current];
  updated[index] = next;
  await redis.set(
    CANDIDATES_KEY,
    updated.map(normalizeCandidate),
  );
  return next;
}

/** Create a new candidate, or +1 requestCount when channel+handle already exists. */
export async function submitSpaceCandidateRequest(input: {
  channel: string;
  handle: string;
}): Promise<{ candidate: AdminSpaceCandidate; created: boolean }> {
  const existing = await findSpaceCandidate(input.channel, input.handle);
  if (existing) {
    const candidate = await incrementSpaceCandidateRequest(input);
    if (!candidate) {
      throw new Error("increment-failed");
    }
    return { candidate, created: false };
  }
  const candidate = await createSpaceCandidate(input);
  return { candidate, created: true };
}

export type SpaceCandidateEditableFields = {
  email: string;
  verifyCode: string;
  verifyCodeExpiresAt: string;
};

/** Persist email / verify-code edits for existing rows. Does not create rows. */
export async function updateSpaceCandidates(
  updates: Array<{ id: string } & SpaceCandidateEditableFields>,
): Promise<AdminSpaceCandidate[]> {
  if (!isRedisConfigured()) {
    throw new Error("Catalog store is not configured.");
  }
  if (updates.length === 0) {
    return listSpaceCandidates();
  }

  const redis = getRedis();
  const current = (await redis.get<AdminSpaceCandidate[]>(CANDIDATES_KEY)) ?? [];
  const byId = new Map(
    updates.map((item) => [
      item.id,
      {
        email: item.email.trim(),
        verifyCode: item.verifyCode.trim(),
        verifyCodeExpiresAt: item.verifyCodeExpiresAt.trim(),
      },
    ]),
  );

  const next = await Promise.all(
    current.map(async (row) => {
      const normalized = normalizeCandidate(row);
      const patch = byId.get(row.id);
      if (!patch) {
        return normalized;
      }

      const email = patch.email || normalized.email;
      const ownerVerified = email ? await isOwnerVerifiedEmail(email) : false;
      // Once registration is complete (or profile already owner-verified),
      // never reopen verify codes / flip registrationComplete back off.
      if (normalized.registrationComplete || ownerVerified) {
        return asCompletedCandidate({
          ...normalized,
          email,
        });
      }

      return normalizeCandidate({
        ...normalized,
        email,
        verifyCode: patch.verifyCode,
        verifyCodeExpiresAt: patch.verifyCodeExpiresAt,
      });
    }),
  );

  await redis.set(CANDIDATES_KEY, next);
  const reconciled = await reconcileOwnerVerifiedRows(next);
  const ensured = await ensureSpacesForCompletedCandidates(reconciled.rows);
  if (reconciled.changed || ensured.changed) {
    await redis.set(CANDIDATES_KEY, ensured.rows);
  }
  return sortCandidates(ensured.rows.map(normalizeCandidate));
}

function sortCandidates(
  rows: AdminSpaceCandidate[],
): AdminSpaceCandidate[] {
  return [...rows].sort((a, b) => {
    const aMs = Date.parse(a.appliedAt) || 0;
    const bMs = Date.parse(b.appliedAt) || 0;
    if (aMs !== bMs) {
      return bMs - aMs;
    }
    return a.handle.localeCompare(b.handle, "ko");
  });
}

/** True when this email is saved on any space-candidate row. */
export async function isEmailMatchedSpaceCandidate(
  email: string,
): Promise<boolean> {
  if (!isRedisConfigured()) {
    return false;
  }
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return false;
  }
  const rows = await listSpaceCandidates();
  return rows.some((row) => normalizeEmail(row.email) === normalized);
}

/**
 * True when email has an active (unexpired) candidate verify code that matches.
 */
export async function matchesActiveOwnerVerifyCode(
  email: string,
  code: string,
): Promise<boolean> {
  if (!isRedisConfigured()) {
    return false;
  }
  const normalized = normalizeEmail(email);
  const trimmed = code.trim();
  if (!normalized || !/^\d{6}$/.test(trimmed)) {
    return false;
  }
  const rows = await listSpaceCandidates();
  return rows.some(
    (row) =>
      normalizeEmail(row.email) === normalized &&
      isVerifyCodeActive(row) &&
      row.verifyCode.trim() === trimmed,
  );
}

/**
 * Invalidate the matched verify code and mark registration complete.
 * Returns false when no active matching candidate row was found.
 */
export async function completeOwnerVerifyOnCandidates(
  email: string,
  code: string,
): Promise<boolean> {
  if (!isRedisConfigured()) {
    throw new Error("Catalog store is not configured.");
  }
  const normalized = normalizeEmail(email);
  const trimmed = code.trim();
  if (!normalized || !/^\d{6}$/.test(trimmed)) {
    return false;
  }

  const redis = getRedis();
  const current = (await redis.get<AdminSpaceCandidate[]>(CANDIDATES_KEY)) ?? [];
  let matched = false;
  const next = current.map((row) => {
    const normalizedRow = normalizeCandidate(row);
    if (
      normalizeEmail(normalizedRow.email) === normalized &&
      isVerifyCodeActive(normalizedRow) &&
      normalizedRow.verifyCode.trim() === trimmed
    ) {
      matched = true;
      return asCompletedCandidate(normalizedRow);
    }
    return normalizedRow;
  });

  if (!matched) {
    return false;
  }

  const ensured = await ensureSpacesForCompletedCandidates(next);
  await redis.set(CANDIDATES_KEY, ensured.rows);
  return true;
}
