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

/** Default grade for newly onboarded accounts. */
export const DEFAULT_PLATFORM_USER_GRADE: PlatformUserGrade = "user3";

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

export const ADMIN_USER_SORT_KEYS = [
  "email",
  "joinedAt",
  "nickname",
  "phone",
  "grade",
] as const;

export type AdminUserSortKey = (typeof ADMIN_USER_SORT_KEYS)[number];
export type AdminUserSortDir = "asc" | "desc";

/** Rank for grade sort: admin → manager → user1 → user2 → user3 → sample. */
export function platformUserGradeRank(grade: string): number {
  const index = (PLATFORM_USER_GRADES as readonly string[]).indexOf(grade);
  return index >= 0 ? index : PLATFORM_USER_GRADES.length;
}

export function filterAdminUsers(
  users: readonly AdminUser[],
  query: string,
): AdminUser[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return [...users];
  }
  return users.filter((user) => {
    const haystack = [
      user.email,
      formatJoinedAt(user.joinedAt),
      user.nickname,
      user.phone,
      user.grade,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });
}

export function compareAdminUsers(
  a: AdminUser,
  b: AdminUser,
  key: AdminUserSortKey,
  dir: AdminUserSortDir,
): number {
  const sign = dir === "asc" ? 1 : -1;
  if (key === "joinedAt") {
    const aMs = Date.parse(a.joinedAt) || 0;
    const bMs = Date.parse(b.joinedAt) || 0;
    if (aMs !== bMs) {
      return (aMs - bMs) * sign;
    }
  } else if (key === "grade") {
    const compared =
      platformUserGradeRank(a.grade) - platformUserGradeRank(b.grade);
    if (compared !== 0) {
      return compared * sign;
    }
  } else {
    const left = String(a[key] ?? "").toLowerCase();
    const right = String(b[key] ?? "").toLowerCase();
    const compared = left.localeCompare(right, "ko");
    if (compared !== 0) {
      return compared * sign;
    }
  }
  return a.email.localeCompare(b.email, "ko");
}

export function sortAdminUsers(
  users: readonly AdminUser[],
  key: AdminUserSortKey,
  dir: AdminUserSortDir,
): AdminUser[] {
  return [...users].sort((a, b) => compareAdminUsers(a, b, key, dir));
}
