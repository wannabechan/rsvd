/**
 * Platform-agnostic space domain.
 * Keep this module free of Next.js, DOM, and React so web and native clients can share it.
 */

import { spaceMatchesAnyInterestRegion } from "@/domain/interest-region";

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
  /** Cumulative reservation count for home-feed ranking. */
  totalReservationCount: number;
  /** ISO timestamp of the most recent reservation on this space. */
  lastReservedAt: string;
  /** ISO timestamp of the most recent like/단골 승인; empty when none. */
  lastLikedAt: string;
  /**
   * Avatar stack: liked users sorted by recent reservation, then recent like.
   * UI caps display (e.g. 7); uncapped length equals totalLikeCount.
   */
  recentReservers: SpaceReserver[];
  /** Full notice text; blank lines are significant. */
  notice: string;
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
 * Home feed (below 내 단골) order:
 * 1) interest-region match (skipped when regions empty)
 * 2) most recently reserved
 * 3) most recently liked
 * 4) cumulative reservations
 * 5) cumulative likes
 * 6) name
 */
export function sortSpacesForHomeFeed(
  spaces: SpaceItem[],
  interestRegions: readonly string[] = [],
): SpaceItem[] {
  const regions = interestRegions.filter((label) => label.trim().length > 0);
  const useRegions = regions.length > 0;

  return [...spaces].sort((a, b) => {
    if (useRegions) {
      const aMatch = spaceMatchesAnyInterestRegion(a.address, regions) ? 1 : 0;
      const bMatch = spaceMatchesAnyInterestRegion(b.address, regions) ? 1 : 0;
      if (bMatch !== aMatch) {
        return bMatch - aMatch;
      }
    }

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

    const aReservationCount = Number(a.totalReservationCount) || 0;
    const bReservationCount = Number(b.totalReservationCount) || 0;
    if (bReservationCount !== aReservationCount) {
      return bReservationCount - aReservationCount;
    }

    const aLikeCount = Number(a.totalLikeCount) || 0;
    const bLikeCount = Number(b.totalLikeCount) || 0;
    if (bLikeCount !== aLikeCount) {
      return bLikeCount - aLikeCount;
    }

    return a.name.localeCompare(b.name, "ko");
  });
}

/** @deprecated Prefer sortSpacesForHomeFeed — recent reservation then like then name. */
export function sortSpacesByRecentReservationDesc(spaces: SpaceItem[]): SpaceItem[] {
  return sortSpacesForHomeFeed(spaces, []);
}

/** Spaces the current user liked, ordered by home-feed rules without region boost. */
export function filterSpacesByLikedIds(
  spaces: SpaceItem[],
  likedSpaceIds: readonly string[],
): SpaceItem[] {
  const liked = new Set(likedSpaceIds);
  return sortSpacesForHomeFeed(
    spaces.filter((space) => liked.has(space.id)),
    [],
  );
}
