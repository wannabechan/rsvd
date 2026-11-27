/**
 * Platform-agnostic space domain.
 * Keep this module free of Next.js, DOM, and React so web and native clients can share it.
 */

export type SpaceReserver = {
  id: string;
  imageUrl: string;
};

/** Liked (단골) member with activity timestamps for avatar ordering. */
export type SpaceRegularMember = {
  userId: string;
  /** ISO timestamp when like/단골 was approved. */
  likedAt: string;
  /** ISO timestamp of this member's most recent reservation; empty if none. */
  lastReservedAt: string;
  imageUrl: string;
};

export type SpaceItem = {
  id: string;
  name: string;
  address: string;
  tagline: string;
  description: string;
  /** Gallery URLs in display order: hero → menu → other. List thumbnail uses [0]. */
  images: string[];
  contact: string;
  onlineLink: string;
  /** Liked (단골) user count. Display with displayLikeCount(). */
  totalLikeCount: number;
  /** ISO timestamp of the most recent reservation on this space. */
  lastReservedAt: string;
  /** ISO timestamp of the most recent like/단골 승인; empty when none. */
  lastLikedAt: string;
  /**
   * Avatar stack: liked users sorted by recent reservation, then recent like.
   * UI caps display (e.g. 7); uncapped length equals totalLikeCount.
   */
  recentReservers: SpaceReserver[];
  notice: string[];
};

/** Avatar order among likers: recent reservation → recent like → userId. */
export function sortSpaceRegularMembers(
  members: readonly SpaceRegularMember[],
): SpaceRegularMember[] {
  return [...members].sort((a, b) => {
    const aReserved = Date.parse(a.lastReservedAt) || 0;
    const bReserved = Date.parse(b.lastReservedAt) || 0;
    if (bReserved !== aReserved) {
      return bReserved - aReserved;
    }
    const aLiked = Date.parse(a.likedAt) || 0;
    const bLiked = Date.parse(b.likedAt) || 0;
    if (bLiked !== aLiked) {
      return bLiked - aLiked;
    }
    return a.userId.localeCompare(b.userId);
  });
}

export function spaceRegularsToAvatarStack(
  members: readonly SpaceRegularMember[],
): SpaceReserver[] {
  return sortSpaceRegularMembers(members).map((member) => ({
    id: member.userId,
    imageUrl: member.imageUrl,
  }));
}

/** Logged-in home: empty “내가 애정하는 단골 매장” body copy. */
export const MY_LIKED_SPACES_EMPTY_MESSAGE =
  "아직 애정하는 단골 매장이 없네요.\n'+' 버튼으로 단골 맺기를 요청하세요.";

/** Heart count shown in UI: reservation-chat setups, minimum 1 when exposed. */
export function displayLikeCount(totalLikeCount: number): number {
  return Math.max(totalLikeCount, 1);
}

/** Build a tel: href from free-form contact text. Empty when no digits. */
export function toTelHref(contact: string): string {
  const digits = contact.replace(/\D/g, "");
  return digits ? `tel:${digits}` : "";
}

/**
 * Platform list order:
 * 1) most recently reserved
 * 2) most recently liked
 * 3) name
 */
export function sortSpacesByRecentReservationDesc(spaces: SpaceItem[]): SpaceItem[] {
  return [...spaces].sort((a, b) => {
    const aReserved = Date.parse(a.lastReservedAt) || 0;
    const bReserved = Date.parse(b.lastReservedAt) || 0;
    if (bReserved !== aReserved) {
      return bReserved - aReserved;
    }
    const aLiked = Date.parse(a.lastLikedAt) || 0;
    const bLiked = Date.parse(b.lastLikedAt) || 0;
    if (bLiked !== aLiked) {
      return bLiked - aLiked;
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
