import type { AuthUser } from "@/domain/auth";

/**
 * Profile-page left header modes (symbol buttons).
 * Default selection on entry is always `setting` (profile settings).
 */
export const PROFILE_HEADER_MODES = [
  "symbol",
  "setting",
  "lock",
  "manager",
  "admin",
] as const;

export type ProfileHeaderMode = (typeof PROFILE_HEADER_MODES)[number];

export const DEFAULT_PROFILE_HEADER_MODE: ProfileHeaderMode = "setting";

export const PROFILE_HEADER_MODE_LABEL: Record<ProfileHeaderMode, string> = {
  symbol: "홈",
  setting: "프로필 설정",
  lock: "사장님인증",
  manager: "사장님페이지",
  admin: "관리자페이지",
};

/**
 * Buttons shown on the profile header by privilege:
 * - below manager → symbol, setting
 * - manager before owner verify → + lock
 * - manager after owner verify → + manager
 * - admin → + admin
 */
export function profileHeaderModesForUser(
  user: Pick<AuthUser, "role" | "canOwnerVerify" | "ownerVerified">,
): ProfileHeaderMode[] {
  const base: ProfileHeaderMode[] = ["symbol", "setting"];
  if (user.role === "admin") {
    return [...base, "admin"];
  }
  if (user.ownerVerified) {
    return [...base, "manager"];
  }
  if (user.canOwnerVerify) {
    return [...base, "lock"];
  }
  return base;
}
