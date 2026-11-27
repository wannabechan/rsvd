/**
 * Platform-agnostic space domain.
 * Keep this module free of Next.js, DOM, and React so web and native clients can share it.
 */

export type SpaceReserver = {
  id: string;
  imageUrl: string;
};

export type SpaceItem = {
  id: string;
  name: string;
  address: string;
  tagline: string;
  description: string;
  images: string[];
  contact: string;
  onlineLink: string;
  /** Reservation-chat setup count. Display with displayLikeCount(). */
  totalLikeCount: number;
  /** ISO timestamp of the most recent reservation on this space. */
  lastReservedAt: string;
  recentReservers: SpaceReserver[];
  notice: string[];
};

/** Logged-in home: empty “내가 애정하는 단골 매장” body copy. */
export const MY_LIKED_SPACES_EMPTY_MESSAGE =
  "아직 애정하는 단골 매장이 없네요.\n아래의 '+' 버튼을 눌러 단골 맺기를 요청하세요.";

/** Heart count shown in UI: reservation-chat setups, minimum 1 when exposed. */
export function displayLikeCount(totalLikeCount: number): number {
  return Math.max(totalLikeCount, 1);
}

/** Build a tel: href from free-form contact text. Empty when no digits. */
export function toTelHref(contact: string): string {
  const digits = contact.replace(/\D/g, "");
  return digits ? `tel:${digits}` : "";
}

/** Platform list order: most recently reserved first. */
export function sortSpacesByRecentReservationDesc(spaces: SpaceItem[]): SpaceItem[] {
  return [...spaces].sort((a, b) => {
    const timeDiff = Date.parse(b.lastReservedAt) - Date.parse(a.lastReservedAt);
    if (timeDiff !== 0) {
      return timeDiff;
    }
    return a.name.localeCompare(b.name, "ko");
  });
}

/** Spaces the current user liked, ordered by recent reservation. */
export function filterSpacesByLikedIds(
  spaces: SpaceItem[],
  likedSpaceIds: readonly string[],
): SpaceItem[] {
  const liked = new Set(likedSpaceIds);
  return sortSpacesByRecentReservationDesc(spaces.filter((space) => liked.has(space.id)));
}
