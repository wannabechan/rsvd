import {
  createEmptyWeekSchedule,
  inviteHandleFromSpaceName,
  SPACE_INVITE_CHANNEL_DEFAULT,
  type AdminSpace,
} from "@/domain/admin-space";
import { SAMPLE_SPACES } from "@/data/spaces";

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
      inviteChannel: SPACE_INVITE_CHANNEL_DEFAULT,
      inviteHandle: inviteHandleFromSpaceName(space.name),
      heroImage: images[0] ?? "",
      menuImages: images.slice(1, 2),
      otherImages: images.slice(2),
      bookingBufferDays: 0,
      maxBookingDays: 30,
      minPartySize: 1,
      maxPartySize: 6,
      currentReservationCount: 0,
      totalReservationCount: space.totalReservationCount ?? 0,
      active: true,
      createdFromCandidate: false,
      createdAt: new Date(Date.UTC(2026, 0, 1 + index)).toISOString(),
      weeklyHours: createEmptyWeekSchedule(),
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
      regularMembers: [],
      lastReservedAt: "",
      lastLikedAt: "",
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
