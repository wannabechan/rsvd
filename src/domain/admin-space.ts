/**
 * Admin space (매장) domain — schedules and listing metadata.
 * Keep free of React/Next/DOM.
 */

import type { SpaceRegularMember } from "@/domain/space";

export const WEEKDAY_KEYS = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;

export type WeekdayKey = (typeof WEEKDAY_KEYS)[number];

export const WEEKDAY_LABELS: Record<WeekdayKey, string> = {
  mon: "월요일",
  tue: "화요일",
  wed: "수요일",
  thu: "목요일",
  fri: "금요일",
  sat: "토요일",
  sun: "일요일",
};

export const WEEKDAY_SHORT: Record<WeekdayKey, string> = {
  mon: "M",
  tue: "T",
  wed: "W",
  thu: "T",
  fri: "F",
  sat: "S",
  sun: "S",
};

export type TimeSlot = {
  id: string;
  start: string; // HH:mm
  end: string;
  intervalMinutes: number;
  maxReservations: number;
  extraBufferDays: number;
};

export type WeekdaySchedule = {
  slots: TimeSlot[];
};

export type ExceptionKind = "closed" | "open";

export type ExceptionDateRange = {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  kind: ExceptionKind;
};

/** Full admin-managed space attributes. */
export type AdminSpace = {
  id: string;
  name: string;
  adminEmail: string;
  /**
   * Notice body as a single text blob (preserves blank lines).
   * Legacy Redis rows may still be string[]; normalize with normalizeNoticesText().
   */
  notices: string;
  address: string;
  contact: string;
  /** Invite channel used when the store was onboarded (read-only in admin UI). */
  inviteChannel: string;
  /** Invite handle / id (read-only); typically space name without spaces. */
  inviteHandle: string;
  heroImage: string;
  menuImages: string[];
  otherImages: string[];
  /** 예약여유일 */
  bookingBufferDays: number;
  /** 최대예약가능일 */
  maxBookingDays: number;
  minPartySize: number;
  maxPartySize: number;
  /**
   * 현재예약수 — stored count of members with a reservation on this space.
   * Kept in sync with regularMembers (see syncAdminSpaceStats).
   */
  currentReservationCount: number;
  /** Cumulative reservations for public home-feed ranking. */
  totalReservationCount: number;
  active: boolean;
  weeklyHours: Record<WeekdayKey, WeekdaySchedule>;
  exceptions: ExceptionDateRange[];
  /**
   * 단골목록 — 라이크 승인된 사용자 id 목록 (regularMembers와 동기).
   * Approval workflow comes later; seed/admin may set directly.
   */
  regularUserIds: string[];
  /**
   * Liked members with per-user reservation/like times for public avatar stacks.
   * Source of truth for 단골수 / reservation-derived stats when present.
   */
  regularMembers: SpaceRegularMember[];
  /** ISO timestamp of most recent reservation; empty when none. */
  lastReservedAt: string;
  /** ISO timestamp of most recent like/단골 승인; empty when none. */
  lastLikedAt: string;
  /**
   * True when created from a completed 매장후보 (사장님 인증).
   * Inactive drafts may omit otherwise-required fields until activated.
   */
  createdFromCandidate: boolean;
  /** ISO timestamp when the catalog space was created. */
  createdAt: string;
};

export const SPACE_NAME_PLACEHOLDER = "매장 이름을 적어주세요.";
export const SPACE_NOTICE_PLACEHOLDER = "손님들께 알려드릴 사항을 적어주세요.";

/** Auto-created candidate store still inactive — required-field waiver. */
export function isCandidateOnboardingDraft(
  space: Pick<AdminSpace, "active" | "createdFromCandidate">,
): boolean {
  return Boolean(space.createdFromCandidate) && space.active === false;
}

export const ADMIN_SPACE_REQUIRED_FIELD_KEYS = [
  "name",
  "address",
  "contact",
  "adminEmail",
  "notices",
  "heroImage",
] as const;

export type AdminSpaceRequiredFieldKey =
  (typeof ADMIN_SPACE_REQUIRED_FIELD_KEYS)[number];

export const ADMIN_SPACE_REQUIRED_FIELD_MESSAGE = "필수 입력 사항입니다.";

type AdminSpaceRequiredFieldValues = {
  name: string;
  address: string;
  contact: string;
  adminEmail: string;
  notices: string;
  heroImage: string;
};

function isAdminSpaceRequiredFieldFilled(
  key: AdminSpaceRequiredFieldKey,
  fields: AdminSpaceRequiredFieldValues,
): boolean {
  if (key === "notices") {
    return Boolean(normalizeNoticesText(fields.notices).trim());
  }
  return Boolean(fields[key].trim());
}

/** Missing required keys in form order (menu/other images excluded). */
export function adminSpaceMissingRequiredFields(
  fields: AdminSpaceRequiredFieldValues,
): AdminSpaceRequiredFieldKey[] {
  return ADMIN_SPACE_REQUIRED_FIELD_KEYS.filter(
    (key) => !isAdminSpaceRequiredFieldFilled(key, fields),
  );
}

/** Required fields except menu/other images. Returns Korean error or null. */
export function adminSpaceRequiredFieldsError(
  fields: AdminSpaceRequiredFieldValues,
): string | null {
  const missing = adminSpaceMissingRequiredFields(fields);
  if (missing.length === 0) {
    return null;
  }
  return ADMIN_SPACE_REQUIRED_FIELD_MESSAGE;
}

/** 단골수 from stored regularMembers (fallback: regularUserIds). */
export function adminSpaceRegularCount(space: AdminSpace): number {
  if (Array.isArray(space.regularMembers) && space.regularMembers.length > 0) {
    return space.regularMembers.length;
  }
  return space.regularUserIds?.length ?? 0;
}

/** 현재예약수 from stored currentReservationCount. */
export function adminSpaceReservationCount(space: AdminSpace): number {
  const stored = Number(space.currentReservationCount);
  return Number.isFinite(stored) && stored >= 0 ? stored : 0;
}

/**
 * Align id list with regularMembers when that array is present.
 * currentReservationCount stays the stored live booking count (0 until real reservations).
 */
/** Infer createdAt from `space-{base36ms}-…` ids when missing on legacy rows. */
export function inferCreatedAtFromSpaceId(id: string): string {
  const match = /^space-([a-z0-9]+)-/i.exec(id.trim());
  if (!match) {
    return "";
  }
  const ms = Number.parseInt(match[1], 36);
  if (!Number.isFinite(ms) || ms < 1_000_000_000_000 || ms > 9_999_999_999_999) {
    return "";
  }
  return new Date(ms).toISOString();
}

export function normalizeSpaceCreatedAt(space: AdminSpace): string {
  if (typeof space.createdAt === "string" && space.createdAt.trim()) {
    return space.createdAt.trim();
  }
  return inferCreatedAtFromSpaceId(space.id);
}

/** Display YYYY-MM-DD for admin tables. */
export function formatSpaceCreatedAt(createdAt: string): string {
  if (/^\d{4}-\d{2}-\d{2}/.test(createdAt)) {
    return createdAt.slice(0, 10);
  }
  const parsed = Date.parse(createdAt);
  if (!Number.isFinite(parsed)) {
    return createdAt || "—";
  }
  return new Date(parsed).toISOString().slice(0, 10);
}

export const ADMIN_SPACE_SORT_KEYS = [
  "name",
  "createdAt",
  "address",
  "openDays",
  "reservationCount",
  "regularCount",
  "active",
] as const;

export type AdminSpaceSortKey = (typeof ADMIN_SPACE_SORT_KEYS)[number];
export type AdminSpaceSortDir = "asc" | "desc";

export function compareAdminSpaces(
  a: AdminSpace,
  b: AdminSpace,
  key: AdminSpaceSortKey,
  dir: AdminSpaceSortDir,
): number {
  const sign = dir === "asc" ? 1 : -1;
  if (key === "createdAt") {
    const aMs = Date.parse(normalizeSpaceCreatedAt(a)) || 0;
    const bMs = Date.parse(normalizeSpaceCreatedAt(b)) || 0;
    if (aMs !== bMs) {
      return (aMs - bMs) * sign;
    }
  } else if (key === "openDays") {
    const compared = openWeekdays(a).length - openWeekdays(b).length;
    if (compared !== 0) {
      return compared * sign;
    }
  } else if (key === "reservationCount") {
    const compared =
      adminSpaceReservationCount(a) - adminSpaceReservationCount(b);
    if (compared !== 0) {
      return compared * sign;
    }
  } else if (key === "regularCount") {
    const compared = adminSpaceRegularCount(a) - adminSpaceRegularCount(b);
    if (compared !== 0) {
      return compared * sign;
    }
  } else if (key === "active") {
    const compared = Number(a.active) - Number(b.active);
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
  return a.id.localeCompare(b.id);
}

export function sortAdminSpaces(
  spaces: readonly AdminSpace[],
  key: AdminSpaceSortKey,
  dir: AdminSpaceSortDir,
): AdminSpace[] {
  return [...spaces].sort((a, b) => compareAdminSpaces(a, b, key, dir));
}

export function syncAdminSpaceStats(space: AdminSpace): AdminSpace {
  const withInvite = withInviteFields(space);
  const notices = normalizeNoticesText(withInvite.notices);
  const createdFromCandidate = Boolean(withInvite.createdFromCandidate);
  const createdAt = normalizeSpaceCreatedAt(withInvite);
  const members = Array.isArray(withInvite.regularMembers)
    ? withInvite.regularMembers
    : [];
  if (members.length === 0) {
    return {
      ...withInvite,
      notices,
      createdFromCandidate,
      createdAt,
      regularUserIds: withInvite.regularUserIds ?? [],
      regularMembers: withInvite.regularMembers ?? [],
      currentReservationCount: adminSpaceReservationCount(withInvite),
    };
  }
  return {
    ...withInvite,
    notices,
    createdFromCandidate,
    createdAt,
    regularMembers: members,
    regularUserIds: members.map((member) => member.userId),
    currentReservationCount: adminSpaceReservationCount(withInvite),
  };
}

export function openWeekdays(space: AdminSpace): WeekdayKey[] {
  return WEEKDAY_KEYS.filter((day) => space.weeklyHours[day].slots.length > 0);
}

export function formatExceptionKind(kind: ExceptionKind): string {
  return kind === "closed" ? "예외휴무" : "예외영업";
}

export function formatSlotSummary(slot: TimeSlot): string {
  return `${slot.start} - ${slot.end} · 간격 ${slot.intervalMinutes}분 · 예약 허용 ${slot.maxReservations}회`;
}

/** Display like `08-20 (목)`. */
export function formatAdminDateLabel(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) {
    return isoDate;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][date.getUTCDay()];
  return `${match[2]}-${match[3]} (${weekday})`;
}

export function createEmptySlot(): TimeSlot {
  return {
    id: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    start: "09:00",
    end: "18:00",
    intervalMinutes: 60,
    maxReservations: 1,
    extraBufferDays: 0,
  };
}

export function cloneDaySlots(
  slots: TimeSlot[],
  day: WeekdayKey,
): TimeSlot[] {
  return slots.map((slot) => ({
    ...slot,
    id: `${day}-${slot.id}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    extraBufferDays: 0,
  }));
}

export function createEmptyWeekSchedule(): Record<WeekdayKey, WeekdaySchedule> {
  return {
    mon: { slots: [] },
    tue: { slots: [] },
    wed: { slots: [] },
    thu: { slots: [] },
    fri: { slots: [] },
    sat: { slots: [] },
    sun: { slots: [] },
  };
}

/** Space gallery image caps (upload UI + validation). */
export const SPACE_HERO_IMAGE_MAX = 1;
export const SPACE_MENU_IMAGES_MAX = 5;
export const SPACE_OTHER_IMAGES_MAX = 20;

/** Normalize legacy string[] notices or string into one textarea blob. */
export function normalizeNoticesText(notices: unknown): string {
  if (typeof notices === "string") {
    return notices.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }
  if (Array.isArray(notices)) {
    return notices
      .filter((item): item is string => typeof item === "string")
      .join("\n")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n");
  }
  return "";
}

/** @deprecated Use normalizeNoticesText — kept for call-site clarity in forms. */
export function noticesToEditableText(notices: string | string[]): string {
  return normalizeNoticesText(notices);
}

/** Default invite channel for catalog spaces. */
export const SPACE_INVITE_CHANNEL_DEFAULT = "인스타그램";

/** Invite handle derived from space name (spaces removed). */
export function inviteHandleFromSpaceName(name: string): string {
  return name.replace(/\s+/g, "");
}

/** Fill invite fields when missing (legacy Redis rows / blank create). */
export function withInviteFields(space: AdminSpace): AdminSpace {
  const inviteChannel =
    typeof space.inviteChannel === "string" && space.inviteChannel.trim()
      ? space.inviteChannel.trim()
      : SPACE_INVITE_CHANNEL_DEFAULT;
  const inviteHandle =
    typeof space.inviteHandle === "string" && space.inviteHandle.trim()
      ? space.inviteHandle.trim()
      : inviteHandleFromSpaceName(space.name);
  if (
    space.inviteChannel === inviteChannel &&
    space.inviteHandle === inviteHandle
  ) {
    return space;
  }
  return {
    ...space,
    inviteChannel,
    inviteHandle,
  };
}

export function createBlankAdminSpace(): AdminSpace {
  return {
    id: "",
    name: "",
    adminEmail: "",
    notices: "",
    address: "",
    contact: "",
    inviteChannel: SPACE_INVITE_CHANNEL_DEFAULT,
    inviteHandle: "",
    heroImage: "",
    menuImages: [],
    otherImages: [],
    bookingBufferDays: 0,
    maxBookingDays: 30,
    minPartySize: 1,
    maxPartySize: 6,
    createdFromCandidate: false,
    createdAt: "",
    currentReservationCount: 0,
    totalReservationCount: 0,
    active: true,
    weeklyHours: createEmptyWeekSchedule(),
    exceptions: [],
    regularUserIds: [],
    regularMembers: [],
    lastReservedAt: "",
    lastLikedAt: "",
  };
}
