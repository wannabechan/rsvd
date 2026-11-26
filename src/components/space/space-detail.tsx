import { SpaceImageCarousel } from "@/components/space/space-image-carousel";
import type { SpaceItem } from "@/data/spaces";

const DETAIL_LIKE_ICON_CLASS = "h-[1.875rem] w-[1.875rem]";
const MAX_DETAIL_LIKER_AVATARS = 15;

type SpaceDetailProps = {
  space: SpaceItem;
};

export function SpaceDetail({ space }: SpaceDetailProps) {
  const phoneHref = normalizePhoneHref(space.contact);
  const recentLikers = space.recentLikers.slice(0, MAX_DETAIL_LIKER_AVATARS);

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
              {Math.max(space.totalLikeCount, 1)}
            </span>
          </div>
          <button
            type="button"
            aria-label={`${space.name} 메신저 예약`}
            className="inline-flex h-[2.8875rem] w-[2.8875rem] shrink-0 translate-x-[3px] items-center justify-center rounded-full transition hover:bg-rsvd-tint"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/rsvd_logo_symbol.png"
              alt=""
              width={800}
              height={800}
              className="h-[2.0625rem] w-[2.0625rem]"
            />
          </button>
        </div>
      </div>

      <p className="mt-2 text-[0.84rem] font-bold break-words text-rsvd-text">{space.address}</p>

      <section className="mt-5 space-y-3" aria-label="매장 공지사항">
        <div className="space-y-3 text-sm leading-[1.4625] text-rsvd-text-muted">
          {space.notice.map((paragraph, index) => (
            <p key={`${space.id}-notice-${index}`}>{paragraph}</p>
          ))}
        </div>
      </section>

      {recentLikers.length > 0 ? (
        <div
          className="mt-5 flex flex-wrap items-center gap-1.5"
          aria-label="라이크한 사용자"
        >
          {recentLikers.map((liker) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={liker.id}
              src={liker.imageUrl}
              alt=""
              className="h-7 w-7 rounded-full object-cover ring-1 ring-rsvd-border"
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}

function normalizePhoneHref(contact: string) {
  const digits = contact.replace(/\D/g, "");
  return digits ? `tel:${digits}` : "";
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
