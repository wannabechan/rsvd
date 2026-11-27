import {
  createEmptyWeekSchedule,
  type AdminSpace,
  type TimeSlot,
  type WeekdayKey,
} from "@/domain/admin-space";
import { SAMPLE_SPACES } from "@/data/spaces";

function lunchDinnerSlots(day: WeekdayKey): TimeSlot[] {
  return [
    {
      id: `${day}-lunch`,
      start: "12:00",
      end: "13:30",
      intervalMinutes: 30,
      maxReservations: 1,
      extraBufferDays: 0,
    },
    {
      id: `${day}-dinner`,
      start: "18:00",
      end: "21:00",
      intervalMinutes: 30,
      maxReservations: 1,
      extraBufferDays: 0,
    },
  ];
}

function scheduleForDays(...days: WeekdayKey[]) {
  const base = createEmptyWeekSchedule();
  for (const day of days) {
    base[day] = { slots: lunchDinnerSlots(day) };
  }
  return base;
}

const WEEKDAY_OPEN = scheduleForDays("mon", "tue", "wed", "thu", "fri");
const WEEKDAY_WITH_SAT = scheduleForDays(
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
);

/** Build the 7 seed stores (단골 links attached during Redis seed). */
export function buildSeedAdminSpaces(): AdminSpace[] {
  return SAMPLE_SPACES.slice(0, 7).map((space, index) => {
    const images = space.images;
    return {
      id: space.id,
      name: space.name,
      adminEmail:
        index === 0 ? "host@example.com" : `host+${space.id}@example.com`,
      notices: space.notice,
      address: space.address,
      contact: space.contact,
      heroImage: images[0] ?? "",
      menuImages: images.slice(1, 2),
      otherImages: images.slice(2),
      bookingBufferDays: 0,
      maxBookingDays: 30,
      minPartySize: 1,
      maxPartySize: 6,
      currentReservationCount: 0,
      active: true,
      weeklyHours: index % 2 === 0 ? WEEKDAY_OPEN : WEEKDAY_WITH_SAT,
      exceptions:
        index === 0
          ? [
              {
                id: "ex-1",
                startDate: "2026-08-20",
                endDate: "2026-08-20",
                kind: "closed",
              },
              {
                id: "ex-2",
                startDate: "2026-09-25",
                endDate: "2026-09-26",
                kind: "closed",
              },
            ]
          : [],
      regularUserIds: [],
      lastReservedAt: space.lastReservedAt,
      lastLikedAt: space.lastLikedAt,
      recentReservers: space.recentReservers,
    };
  });
}

/** @deprecated Prefer listCatalogSpaces() — kept for local fallbacks. */
export function listAdminSpaces(): AdminSpace[] {
  return buildSeedAdminSpaces();
}

export function getAdminSpaceById(id: string): AdminSpace | null {
  return buildSeedAdminSpaces().find((space) => space.id === id) ?? null;
}
