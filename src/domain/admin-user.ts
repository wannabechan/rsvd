/**
 * Admin-managed platform users.
 */

export const PLATFORM_USER_GRADES = [
  "admin",
  "manager",
  "user1",
  "user2",
  "user3",
  "sample",
] as const;

export type PlatformUserGrade = (typeof PLATFORM_USER_GRADES)[number];

export type AdminUser = {
  id: string;
  email: string;
  /** ISO date (YYYY-MM-DD or full ISO). */
  joinedAt: string;
  nickname: string;
  phone: string;
  grade: PlatformUserGrade;
};

export function formatJoinedAt(joinedAt: string): string {
  if (/^\d{4}-\d{2}-\d{2}/.test(joinedAt)) {
    return joinedAt.slice(0, 10);
  }
  const parsed = Date.parse(joinedAt);
  if (!Number.isFinite(parsed)) {
    return joinedAt;
  }
  return new Date(parsed).toISOString().slice(0, 10);
}
