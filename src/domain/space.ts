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
  recentReservers: SpaceReserver[];
  notice: string[];
};

/** Heart count shown in UI: reservation-chat setups, minimum 1 when exposed. */
export function displayLikeCount(totalLikeCount: number): number {
  return Math.max(totalLikeCount, 1);
}

/** Build a tel: href from free-form contact text. Empty when no digits. */
export function toTelHref(contact: string): string {
  const digits = contact.replace(/\D/g, "");
  return digits ? `tel:${digits}` : "";
}

/** Default guest list order: most likes first. */
export function sortSpacesByLikeCountDesc(spaces: SpaceItem[]): SpaceItem[] {
  return [...spaces].sort((a, b) => {
    const likeDiff = displayLikeCount(b.totalLikeCount) - displayLikeCount(a.totalLikeCount);
    if (likeDiff !== 0) {
      return likeDiff;
    }
    return a.name.localeCompare(b.name, "ko");
  });
}
