/**
 * Admin space candidates store (Redis).
 */

import {
  candidateHandlesMatch,
  candidateRequestCount,
  createSpaceCandidateId,
  isSpaceCandidateChannel,
  normalizeCandidateHandle,
  type AdminSpaceCandidate,
  type SpaceCandidateChannel,
} from "@/domain/admin-space-candidate";
import { getRedis, isRedisConfigured } from "@/lib/redis";

const CANDIDATES_KEY = "rsvd:catalog:space-candidates:v1";

function normalizeCandidate(row: AdminSpaceCandidate): AdminSpaceCandidate {
  return {
    ...row,
    requestCount: candidateRequestCount(row),
  };
}

export async function listSpaceCandidates(): Promise<AdminSpaceCandidate[]> {
  if (!isRedisConfigured()) {
    return [];
  }
  const rows = await getRedis().get<AdminSpaceCandidate[]>(CANDIDATES_KEY);
  return sortCandidates((rows ?? []).map(normalizeCandidate));
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
    requestCount: 1,
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
