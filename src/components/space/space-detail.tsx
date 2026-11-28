"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { useReservationChat } from "@/components/reservation-chat/reservation-chat-context";
import { ReservationChatPanel } from "@/components/reservation-chat/reservation-chat-panel";
import { SpaceImageCarousel } from "@/components/space/space-image-carousel";
import { SpaceNoticeText } from "@/components/space/space-notice-text";
import { displayLikeCount, toTelHref, type SpaceItem } from "@/domain/space";
import { brandLogos } from "@/lib/brand-assets";
import { routes } from "@/lib/routes";

const DETAIL_LIKE_ICON_CLASS = "h-[1.875rem] w-[1.875rem]";
const MAX_DETAIL_RESERVER_AVATARS = 7;

type SpaceDetailProps = {
  space: SpaceItem;
};

export function SpaceDetail({ space }: SpaceDetailProps) {
  const router = useRouter();
  const { isLoggedIn, isReady } = useAuth();
  const { activeChat, startChat, setDetailSpace } = useReservationChat();
  const phoneHref = toTelHref(space.contact);
  const recentReservers = space.recentReservers.slice(0, MAX_DETAIL_RESERVER_AVATARS);
  const isChatOpen = activeChat?.spaceId === space.id;

  useEffect(() => {
    if (!isReady) {
      return;
    }
    if (!isLoggedIn) {
      router.replace(routes.spaceList);
    }
  }, [isReady, isLoggedIn, router]);

  useEffect(() => {
    setDetailSpace({ spaceId: space.id, spaceName: space.name });
    return () => {
      setDetailSpace(null);
    };
  }, [space.id, space.name, setDetailSpace]);

  if (!isReady || !isLoggedIn) {
    return (
      <div className="px-4 py-10">
        <p className="text-sm text-rsvd-text-muted">불러오는 중…</p>
      </div>
    );
  }

  if (isChatOpen) {
    return <ReservationChatPanel space={space} />;
  }

  function openMessenger() {
    startChat({ spaceId: space.id, spaceName: space.name });
  }

  return (
    <article className="px-4 pb-10 pt-4">
      <SpaceImageCarousel
        images={space.images}
        spaceName={space.name}
        phoneHref={phoneHref}
      />

      <div className="mt-4 flex items-center justify-between gap-3">
        <h1 className="min-w-0 text-[1.18125rem] font-medium break-words text-rsvd-text">
          {space.name}
        </h1>
        <div className="flex shrink-0 items-center gap-1">
          <div className="inline-flex -translate-y-[4px] items-center gap-1 text-rsvd-text-muted">
            <span
              className={`inline-flex translate-y-[2px] items-center justify-center ${DETAIL_LIKE_ICON_CLASS}`}
            >
              <HeartIcon />
            </span>
            <span className="translate-y-[4px] text-[1.05rem] font-medium">
              {displayLikeCount(space.totalLikeCount)}
            </span>
          </div>
          <button
            type="button"
            aria-label={`${space.name} 메신저 예약`}
            className="messenger-attention inline-flex h-[2.8875rem] w-[2.8875rem] shrink-0 translate-x-[3px] items-center justify-center rounded-full transition hover:bg-rsvd-tint"
            onClick={openMessenger}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brandLogos.symbol}
              alt=""
              width={800}
              height={800}
              className="h-[2.0625rem] w-[2.0625rem]"
            />
          </button>
        </div>
      </div>

      <p className="mt-2 text-[0.84rem] font-bold break-words text-rsvd-text">{space.address}</p>

      <section className="mt-5" aria-label="매장 공지사항">
        <SpaceNoticeText
          text={space.notice}
          className="text-sm leading-[1.4625] text-rsvd-text-muted"
        />
      </section>

      <div className="mt-5 flex items-center gap-1.5">
        <div
          className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5"
          aria-label="단골 사용자"
        >
          {recentReservers.map((reserver) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={reserver.id}
              src={reserver.imageUrl}
              alt=""
              className="h-7 w-7 rounded-full object-cover ring-1 ring-rsvd-border"
            />
          ))}
        </div>
        <Link
          href={routes.spaceList}
          aria-label="공간 리스트로 돌아가기"
          className="inline-flex h-[2.25rem] w-[2.25rem] shrink-0 items-center justify-center text-[1.9125rem] font-thin leading-none text-rsvd-border"
        >
          ←
        </Link>
      </div>
    </article>
  );
}

function HeartIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`block shrink-0 fill-rsvd-danger text-rsvd-danger ${DETAIL_LIKE_ICON_CLASS}`}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20.5s-6.9-4.35-6.9-9.45c0-2.55 2.1-4.55 4.65-4.55 1.45 0 2.75.7 3.55 1.8.8-1.1 2.1-1.8 3.55-1.8 2.55 0 4.65 2 4.65 4.55 0 5.1-6.9 9.45-6.9 9.45z" />
    </svg>
  );
}
