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
};

export const SPACE_NAME_PLACEHOLDER = "매장 이름을 적어주세요.";
export const SPACE_NOTICE_PLACEHOLDER = "손님들께 알려드릴 사항을 적어주세요.";

/** Auto-created candidate store still inactive — required-field waiver. */
export function isCandidateOnboardingDraft(
  space: Pick<AdminSpace, "active" | "createdFromCandidate">,
): boolean {
  return Boolean(space.createdFromCandidate) && space.active === false;
}

/** Required fields except menu/other images. Returns Korean error or null. */
export function adminSpaceRequiredFieldsError(fields: {
  name: string;
  address: string;
  contact: string;
  adminEmail: string;
  notices: string;
  heroImage: string;
}): string | null {
  if (!fields.name.trim()) {
    return "공간명칭을 입력해 주세요.";
  }
  if (!fields.address.trim()) {
    return "주소를 입력해 주세요.";
  }
  if (!fields.contact.trim()) {
    return "연락처를 입력해 주세요.";
  }
  if (!fields.adminEmail.trim()) {
    return "관리자 이메일을 입력해 주세요.";
  }
  if (!normalizeNoticesText(fields.notices).trim()) {
    return "공지사항을 입력해 주세요.";
  }
  if (!fields.heroImage.trim()) {
    return "대표 이미지를 업로드해 주세요.";
  }
  return null;
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
export function syncAdminSpaceStats(space: AdminSpace): AdminSpace {
  const withInvite = withInviteFields(space);
  const notices = normalizeNoticesText(withInvite.notices);
  const createdFromCandidate = Boolean(withInvite.createdFromCandidate);
  const members = Array.isArray(withInvite.regularMembers)
    ? withInvite.regularMembers
    : [];
  if (members.length === 0) {
    return {
      ...withInvite,
      notices,
      createdFromCandidate,
      regularUserIds: withInvite.regularUserIds ?? [],
      regularMembers: withInvite.regularMembers ?? [],
      currentReservationCount: adminSpaceReservationCount(withInvite),
    };
  }
  return {
    ...withInvite,
    notices,
    createdFromCandidate,
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
