import Link from "next/link";
import type { SpaceItem } from "@/data/spaces";

const LIKE_ICON_SIZE_CLASS = "h-[1.05rem] w-[1.05rem]";
const REVIEW_PREVIEW_MAX_CHARS = 15;
const SPACE_NAME_MAX_CHARS = 15;

type SpaceCardProps = {
  space: SpaceItem;
};

export function SpaceCard({ space }: SpaceCardProps) {
  const detailHref = `/space/${space.id}`;
  const displayName = truncateText(space.name, SPACE_NAME_MAX_CHARS);
  const reviewPreview = truncateText(space.latestCommentPreview, REVIEW_PREVIEW_MAX_CHARS);

  return (
    <article className="min-w-0 space-y-2">
      <Link href={detailHref} className="block pb-1" aria-label={`${space.name} 상세 보기`}>
        {space.thumbnailImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={space.thumbnailImage}
            alt={space.name}
            loading="lazy"
            decoding="async"
            className="aspect-[4/5] w-full rounded-2xl object-cover"
          />
        ) : (
          <div aria-hidden="true" className="aspect-[4/5] w-full rounded-2xl bg-rsvd-tint" />
        )}
      </Link>

      <div className="flex items-center justify-between gap-2">
        <h2
          className="min-w-0 text-[1.18125rem] font-medium text-rsvd-text"
          title={space.name !== displayName ? space.name : undefined}
        >
          {displayName}
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
        {reviewPreview ? (
          <div className="flex min-w-0 items-center gap-1 text-[0.72rem] text-rsvd-text-muted">
            <span className="inline-flex h-[1.05rem] w-[1.05rem] shrink-0 items-center justify-center rounded-full bg-rsvd-brand text-[0.54rem] font-semibold text-rsvd-on-brand">
              R
            </span>
            <span className="min-w-0 truncate">{reviewPreview}</span>
          </div>
        ) : (
          <span aria-hidden="true" className="min-w-0" />
        )}
        <div className="inline-flex shrink-0 items-center gap-0.5 text-rsvd-text-muted">
          <span className={`inline-flex items-center justify-center ${LIKE_ICON_SIZE_CLASS}`}>
            <HeartIcon />
          </span>
          {space.totalLikeCount > 0 ? (
            <span className="text-[0.72rem]">{space.totalLikeCount}</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function truncateText(value: string | null | undefined, maxChars: number) {
  const text = value?.trim() ?? "";
  if (!text) {
    return null;
  }
  if (text.length <= maxChars) {
    return text;
  }
  return `${text.slice(0, maxChars)}…`;
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
