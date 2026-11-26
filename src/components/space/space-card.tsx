"use client";

import { useCallback, useState } from "react";
import type { SpaceItem } from "@/data/spaces";

const ACTION_ICON_SIZE_CLASS = "h-4 w-4";
const LIKE_ICON_SIZE_CLASS = "h-3.5 w-3.5";

type SpaceCardProps = {
  space: SpaceItem;
};

export function SpaceCard({ space }: SpaceCardProps) {
  const [showDescription, setShowDescription] = useState(false);
  const phoneHref = normalizePhoneHref(space.contact);

  const handleToggleDescription = useCallback(() => {
    setShowDescription((current) => !current);
  }, []);

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
        <h2 className="min-w-0 truncate text-sm font-medium text-rsvd-text">{space.name}</h2>
        <button
          type="button"
          aria-label={`${space.name} 메신저 예약`}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition hover:bg-rsvd-tint"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/rsvd_logo_symbol.png"
            alt=""
            width={800}
            height={800}
            className="h-5 w-5"
          />
        </button>
      </div>

      <p className="truncate text-[0.7rem] font-bold text-rsvd-text">{space.address}</p>

      <div className="flex flex-col gap-1">
        <p className="line-clamp-2 text-[0.65rem] text-rsvd-text-muted">{space.tagline}</p>
        <button
          type="button"
          aria-expanded={showDescription}
          onClick={handleToggleDescription}
          className="text-left text-[0.65rem] text-rsvd-text-muted underline transition hover:text-rsvd-text"
        >
          {showDescription ? "less info." : "more info."}
        </button>
        {showDescription ? (
          <p className="text-[0.65rem] leading-relaxed text-rsvd-text-muted whitespace-pre-line">
            {space.description}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-1.5 pt-1">
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            disabled
            aria-label="메뉴판 링크 없음"
            className={`inline-flex items-center justify-center text-rsvd-border ${ACTION_ICON_SIZE_CLASS}`}
          >
            <MenuBookIcon />
          </button>
          {phoneHref ? (
            <a
              href={phoneHref}
              aria-label="전화 걸기"
              className={`inline-flex items-center justify-center text-rsvd-text-muted transition hover:text-rsvd-text ${ACTION_ICON_SIZE_CLASS}`}
            >
              <PhoneIcon />
            </a>
          ) : (
            <button
              type="button"
              disabled
              aria-label="연락처 없음"
              className={`inline-flex items-center justify-center text-rsvd-border ${ACTION_ICON_SIZE_CLASS}`}
            >
              <PhoneIcon />
            </button>
          )}
        </div>

        <div className="flex min-w-0 items-center justify-end gap-1">
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
      </div>
    </article>
  );
}

function normalizePhoneHref(contact: string) {
  const digits = contact.replace(/\D/g, "");
  return digits ? `tel:${digits}` : "";
}

function MenuBookIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`block shrink-0 ${ACTION_ICON_SIZE_CLASS}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5.5v14" />
      <path d="M12 5.5c-2.2-.9-4.6-.5-6 1.2v11.8c2-.5 4-.5 6 1" />
      <path d="M12 5.5c2.2-.9 4.6-.5 6 1.2v11.8c-2-.5-4-.5-6 1" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`block shrink-0 ${ACTION_ICON_SIZE_CLASS}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.2 4.5h3.6l1.6 3.8-2.1 1.3a8.5 8.5 0 0 0 3.9 3.9l1.3-2.1 3.8 1.6v3.6c0 .7-.6 1.3-1.3 1.3A11.8 11.8 0 0 1 6.9 5.8c0-.7.6-1.3 1.3-1.3z" />
    </svg>
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
