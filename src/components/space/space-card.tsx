import type { SpaceItem } from "@/data/spaces";

const LIKE_ICON_SIZE_CLASS = "h-3.5 w-3.5";

type SpaceCardProps = {
  space: SpaceItem;
};

export function SpaceCard({ space }: SpaceCardProps) {
  return (
    <article className="min-w-0 space-y-2">
      <div className="pb-1">
        {space.thumbnailImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={space.thumbnailImage}
            alt={space.name}
            loading="lazy"
            decoding="async"
            className="aspect-[4/5] w-full object-cover"
          />
        ) : (
          <div aria-hidden="true" className="aspect-[4/5] w-full bg-rsvd-tint" />
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <h2 className="min-w-0 truncate text-[1.3125rem] font-medium text-rsvd-text">{space.name}</h2>
        <button
          type="button"
          aria-label={`${space.name} 메신저 예약`}
          className="inline-flex h-[2.625rem] w-[2.625rem] shrink-0 items-center justify-center rounded-full transition hover:bg-rsvd-tint"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/rsvd_logo_symbol.png"
            alt=""
            width={800}
            height={800}
            className="h-[1.875rem] w-[1.875rem]"
          />
        </button>
      </div>

      <p className="truncate text-[0.84rem] font-bold text-rsvd-text">{space.address}</p>

      <p className="line-clamp-2 text-[0.65rem] text-rsvd-text-muted">{space.tagline}</p>

      <div className="flex min-w-0 items-center justify-end gap-1 pt-1">
        {space.latestCommentPreview ? (
          <div className="flex min-w-0 max-w-[5.5rem] items-center gap-1 text-[0.6rem] text-rsvd-text-muted">
            <span className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-rsvd-brand text-[0.45rem] font-semibold text-rsvd-on-brand">
              R
            </span>
            <span className="min-w-0 truncate">{space.latestCommentPreview}</span>
          </div>
        ) : null}
        <div className="inline-flex shrink-0 items-center gap-0.5 text-rsvd-text-muted">
          <span className={`inline-flex items-center justify-center ${LIKE_ICON_SIZE_CLASS}`}>
            <HeartIcon />
          </span>
          {space.totalLikeCount > 0 ? (
            <span className="text-[0.6rem]">{space.totalLikeCount}</span>
          ) : null}
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
