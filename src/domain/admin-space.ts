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
  /** Notice body as lines (including empty lines for blank-line spacing). */
  notices: string[];
  address: string;
  contact: string;
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
};

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
export function syncAdminSpaceStats(space: AdminSpace): AdminSpace {
  const members = Array.isArray(space.regularMembers) ? space.regularMembers : [];
  if (members.length === 0) {
    return {
      ...space,
      regularUserIds: space.regularUserIds ?? [],
      regularMembers: space.regularMembers ?? [],
      currentReservationCount: adminSpaceReservationCount(space),
    };
  }
  return {
    ...space,
    regularMembers: members,
    regularUserIds: members.map((member) => member.userId),
    currentReservationCount: adminSpaceReservationCount(space),
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

/** Round-trip notice textarea ↔ stored lines (keeps blank lines). */
export function noticesToEditableText(notices: string[]): string {
  return notices.join("\n");
}

export function editableTextToNotices(text: string): string[] {
  return text.split("\n");
}

export function createBlankAdminSpace(): AdminSpace {
  return {
    id: "",
    name: "",
    adminEmail: "",
    notices: [],
    address: "",
    contact: "",
    heroImage: "",
    menuImages: [],
    otherImages: [],
    bookingBufferDays: 0,
    maxBookingDays: 30,
    minPartySize: 1,
    maxPartySize: 6,
    currentReservationCount: 0,
    active: true,
    weeklyHours: createEmptyWeekSchedule(),
    exceptions: [],
    regularUserIds: [],
    regularMembers: [],
    lastReservedAt: "",
    lastLikedAt: "",
  };
}
