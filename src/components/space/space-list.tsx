"use client";

import { useAuth } from "@/components/auth/auth-context";
import { FloatingAddButton } from "@/components/layout/floating-add-button";
import { SpaceCard } from "@/components/space/space-card";
import { getLikedSpaceIdsForUser } from "@/data/user-likes";
import { normalizeInterestRegions } from "@/domain/interest-region";
import {
  filterSpacesByLikedIds,
  MY_LIKED_SPACES_EMPTY_MESSAGE,
  sortSpacesForHomeFeed,
  type SpaceItem,
} from "@/domain/space";

type SpaceListProps = {
  spaces: SpaceItem[];
};

export function SpaceList({ spaces }: SpaceListProps) {
  const { user, isReady, isLoggedIn } = useAuth();
  const interestRegions = normalizeInterestRegions(user?.interestRegions);
  const platformSpaces = sortSpacesForHomeFeed(spaces, interestRegions);

  if (!isReady) {
    return (
      <>
        <div className="px-4 pb-24 pt-4">
          <p className="text-sm text-rsvd-text-muted">불러오는 중…</p>
        </div>
        <FloatingAddButton attention />
      </>
    );
  }

  if (!isLoggedIn || !user) {
    return (
      <>
        <div className="px-4 pb-24 pt-4">
          <SpaceGrid spaces={platformSpaces} />
        </div>
        <FloatingAddButton attention />
      </>
    );
  }

  const myLikedSpaces = filterSpacesByLikedIds(
    spaces,
    getLikedSpaceIdsForUser(user.id),
  );
  const needsFavoriteAttention = myLikedSpaces.length === 0;

  return (
    <>
      <div className="px-4 pb-24 pt-4">
        <section aria-labelledby="my-liked-spaces-heading">
          <h2
            id="my-liked-spaces-heading"
            className="mt-[3px] text-sm font-medium text-rsvd-text"
          >
            내가 애정하는 단골 매장
          </h2>
          {myLikedSpaces.length > 0 ? (
            <div className="mt-3">
              <SpaceGrid spaces={myLikedSpaces} />
            </div>
          ) : (
            <p className="mt-3 whitespace-pre-line text-[1.1375rem] leading-relaxed text-rsvd-text-muted">
              {MY_LIKED_SPACES_EMPTY_MESSAGE}
            </p>
          )}
        </section>

        <hr className="my-6 border-0 border-t border-rsvd-border" />

        <section aria-label="플랫폼에 라이크가 발생된 공간">
          <SpaceGrid spaces={platformSpaces} />
        </section>
      </div>
      <FloatingAddButton attention={needsFavoriteAttention} />
    </>
  );
}

function SpaceGrid({ spaces }: { spaces: SpaceItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-[26px]">
      {spaces.map((space) => (
        <SpaceCard key={space.id} space={space} />
      ))}
    </div>
  );
}
