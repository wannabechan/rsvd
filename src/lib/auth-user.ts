/**
 * Shared server helper to return AuthUser with profile fields.
 */

import {
  defaultNickname,
  normalizeEmail,
  userIdFromEmail,
  type AuthUser,
} from "@/domain/auth";
import { buildAuthUser, isUserStoreConfigured } from "@/lib/user-store";

/** Prefer Redis profile; fall back to email local-part defaults when store is down. */
export async function resolveAuthUser(email: string): Promise<AuthUser> {
  const normalized = normalizeEmail(email);
  if (!isUserStoreConfigured()) {
    return {
      id: userIdFromEmail(normalized),
      email: normalized,
      nickname: defaultNickname(normalized),
      avatarUrl: null,
    };
  }
  return buildAuthUser(normalized);
}
