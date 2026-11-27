"use client";

import { useAuth } from "@/components/auth/auth-context";
import { FloatingAddButton } from "@/components/layout/floating-add-button";
import { SpaceCard } from "@/components/space/space-card";
import { getLikedSpaceIdsForUser } from "@/data/user-likes";
import {
  filterSpacesByLikedIds,
  MY_LIKED_SPACES_EMPTY_MESSAGE,
  sortSpacesByRecentReservationDesc,
  type SpaceItem,
} from "@/domain/space";

type SpaceListProps = {
  spaces: SpaceItem[];
};

export function SpaceList({ spaces }: SpaceListProps) {
  const { user, isReady, isLoggedIn } = useAuth();
  const platformSpaces = sortSpacesByRecentReservationDesc(spaces);

  if (!isReady) {
    return (
      <>
        <div className="px-4 pb-24 pt-4">
          <p className="text-sm text-rsvd-text-muted">불러오는 중…</p>
        </div>
        <FloatingAddButton />
      </>
    );
  }

  if (!isLoggedIn || !user) {
    return (
      <>
        <div className="px-4 pb-24 pt-4">
          <SpaceGrid spaces={platformSpaces} />
        </div>
        <FloatingAddButton />
      </>
    );
  }

  const myLikedSpaces = filterSpacesByLikedIds(
    spaces,
    getLikedSpaceIdsForUser(user.id),
  );

  return (
    <>
      <div className="px-4 pb-24 pt-4">
        <section aria-labelledby="my-liked-spaces-heading">
          <h2
            id="my-liked-spaces-heading"
            className="text-sm font-medium text-rsvd-text"
          >
            내가 애정하는 단골 매장
          </h2>
          {myLikedSpaces.length > 0 ? (
            <div className="mt-3">
              <SpaceGrid spaces={myLikedSpaces} />
            </div>
          ) : (
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-rsvd-text-muted">
              {MY_LIKED_SPACES_EMPTY_MESSAGE}
            </p>
          )}
        </section>

        <hr className="my-6 border-0 border-t border-rsvd-border" />

        <section aria-label="플랫폼에 라이크가 발생된 공간">
          <SpaceGrid spaces={platformSpaces} />
        </section>
      </div>
      <FloatingAddButton />
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
