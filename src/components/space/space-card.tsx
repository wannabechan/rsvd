import Link from "next/link";
import type { SpaceItem } from "@/data/spaces";

const LIKE_ICON_SIZE_CLASS = "h-[1.05rem] w-[1.05rem]";
const MAX_RESERVER_AVATARS = 7;

type SpaceCardProps = {
  space: SpaceItem;
};

export function SpaceCard({ space }: SpaceCardProps) {
  const detailHref = `/space/${space.id}`;
  const thumbnail = space.images[0] ?? "";
  const recentReservers = space.recentReservers.slice(0, MAX_RESERVER_AVATARS);

  return (
    <article className="min-w-0 space-y-2">
      <Link href={detailHref} className="block pb-1" aria-label={`${space.name} 상세 보기`}>
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={space.name}
            loading="lazy"
            decoding="async"
            className="aspect-[4/5] w-full rounded-2xl object-cover"
          />
        ) : (
          <div aria-hidden="true" className="aspect-[4/5] w-full rounded-2xl bg-rsvd-tint" />
        )}
      </Link>

      <div className="flex min-w-0 items-center gap-2">
        <h2
          className="min-w-0 flex-1 truncate text-[1.1221875rem] font-medium text-rsvd-text"
          title={space.name}
        >
          {space.name}
        </h2>
        <Link
          href={detailHref}
          aria-label={`${space.name} 메신저 예약`}
          className="inline-flex h-[2.625rem] w-[2.625rem] shrink-0 translate-x-[3px] items-center justify-center rounded-full transition hover:bg-rsvd-tint"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/rsvd_logo_symbol.png"
            alt=""
            width={800}
            height={800}
            className="h-[1.875rem] w-[1.875rem]"
          />
        </Link>
      </div>

      <p className="truncate text-[0.84rem] font-bold text-rsvd-text">{space.address}</p>

      <div className="flex min-w-0 items-center justify-between gap-2 pt-1">
        {recentReservers.length > 0 ? (
          <div className="flex min-w-0 items-center" aria-label="최근 예약한 사용자">
            {recentReservers.map((reserver, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={reserver.id}
                src={reserver.imageUrl}
                alt=""
                className="h-[1.05rem] w-[1.05rem] rounded-full object-cover ring-1 ring-rsvd-surface"
                style={{ marginLeft: index === 0 ? 0 : -4 }}
              />
            ))}
          </div>
        ) : (
          <span aria-hidden="true" className="min-w-0" />
        )}
        <div className="inline-flex shrink-0 -translate-y-[2px] items-center gap-0.5 text-rsvd-text-muted">
          <span
            className={`inline-flex translate-y-[1px] items-center justify-center ${LIKE_ICON_SIZE_CLASS}`}
          >
            <HeartIcon />
          </span>
          <span className="translate-y-[2px] text-[0.72rem]">
            {Math.max(space.totalLikeCount, 1)}
          </span>
        </div>
      </div>
    </article>
  );
}

function HeartIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`block shrink-0 fill-rsvd-danger text-rsvd-danger ${LIKE_ICON_SIZE_CLASS}`}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20.5s-6.9-4.35-6.9-9.45c0-2.55 2.1-4.55 4.65-4.55 1.45 0 2.75.7 3.55 1.8.8-1.1 2.1-1.8 3.55-1.8 2.55 0 4.65 2 4.65 4.55 0 5.1-6.9 9.45-6.9 9.45z" />
    </svg>
  );
}
