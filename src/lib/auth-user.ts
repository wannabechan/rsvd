/**
 * Shared server helper to return AuthUser with profile fields.
 */

import {
  defaultNickname,
  normalizeEmail,
  userIdFromEmail,
  type AuthUser,
} from "@/domain/auth";
import { resolveUserRole } from "@/lib/admin";
import { buildAuthUser, isUserStoreConfigured } from "@/lib/user-store";

/** Prefer Redis profile; fall back to email local-part defaults when store is down. */
export async function resolveAuthUser(email: string): Promise<AuthUser> {
  const normalized = normalizeEmail(email);
  const role = resolveUserRole(normalized);
  if (!isUserStoreConfigured()) {
    return {
      id: userIdFromEmail(normalized),
      email: normalized,
      nickname: defaultNickname(normalized),
      phone: null,
      interestRegions: [],
      avatarUrl: null,
      role,
    };
  }
  return buildAuthUser(normalized);
}
