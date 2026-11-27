/**
 * Admin space (매장) domain — schedules and listing metadata.
 * Keep free of React/Next/DOM.
 */

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
  /** 현재예약수 (표시용) */
  currentReservationCount: number;
  active: boolean;
  weeklyHours: Record<WeekdayKey, WeekdaySchedule>;
  exceptions: ExceptionDateRange[];
  /**
   * 단골목록 — 라이크 승인된 사용자 id 목록.
   * Approval workflow comes later; seed/admin may set directly.
   */
  regularUserIds: string[];
  /** ISO timestamp of most recent reservation; empty when none. */
  lastReservedAt: string;
};

export function openWeekdays(space: AdminSpace): WeekdayKey[] {
  return WEEKDAY_KEYS.filter((day) => space.weeklyHours[day].slots.length > 0);
}

export function formatExceptionKind(kind: ExceptionKind): string {
  return kind === "closed" ? "예외휴무" : "예외영업";
}

export function formatSlotSummary(slot: TimeSlot): string {
  return `${slot.start} - ${slot.end} · 간격 ${slot.intervalMinutes}분 · 예약 허용 ${slot.maxReservations}회 · 추가 여유일 ${slot.extraBufferDays}일`;
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
    start: "12:00",
    end: "13:30",
    intervalMinutes: 30,
    maxReservations: 1,
    extraBufferDays: 0,
  };
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
