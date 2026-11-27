"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { routes } from "@/lib/routes";

type SpaceImageCarouselProps = {
  images: string[];
  spaceName: string;
  phoneHref: string;
};

export function SpaceImageCarousel({
  images,
  spaceName,
  phoneHref,
}: SpaceImageCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = images.length > 0 ? images : [""];

  const syncActiveIndex = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    const width = scroller.clientWidth || 1;
    const nextIndex = Math.round(scroller.scrollLeft / width);
    setActiveIndex(Math.min(Math.max(nextIndex, 0), slides.length - 1));
  }, [slides.length]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    syncActiveIndex();
    scroller.addEventListener("scroll", syncActiveIndex, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", syncActiveIndex);
    };
  }, [syncActiveIndex]);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((imageUrl, index) => (
          <div key={`${spaceName}-image-${index}`} className="w-full shrink-0 snap-center">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={`${spaceName} 이미지 ${index + 1}`}
                className="aspect-[4/5] w-full object-cover"
                draggable={false}
              />
            ) : (
              <div aria-hidden="true" className="aspect-[4/5] w-full bg-rsvd-tint" />
            )}
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-3 flex h-10 items-center justify-between px-3">
        <Link
          href={routes.spaceList}
          aria-label="공간 리스트로 돌아가기"
          className="pointer-events-auto inline-flex h-[2.25rem] w-[2.25rem] items-center justify-center text-[1.9125rem] font-thin leading-none text-rsvd-on-brand opacity-75 drop-shadow"
        >
          ←
        </Link>

        {phoneHref ? (
          <a
            href={phoneHref}
            aria-label={`${spaceName}에 전화하기`}
            className="pointer-events-auto inline-flex h-[2.375rem] w-[2.375rem] items-center justify-center text-rsvd-on-brand opacity-75 drop-shadow"
          >
            <PhoneIcon />
          </a>
        ) : (
          <button
            type="button"
            disabled
            aria-label="연락처 없음"
            className="pointer-events-auto inline-flex h-[2.375rem] w-[2.375rem] items-center justify-center text-rsvd-on-brand/50"
          >
            <PhoneIcon />
          </button>
        )}
      </div>

      {slides.length > 1 ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
          {slides.map((_, index) => (
            <span
              key={`${spaceName}-dot-${index}`}
              className={`h-1.5 w-1.5 rounded-full ${
                index === activeIndex ? "bg-rsvd-on-brand" : "bg-rsvd-on-brand/45"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[2.375rem] w-[2.375rem]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.2 4.5h3.6l1.6 3.8-2.1 1.3a8.5 8.5 0 0 0 3.9 3.9l1.3-2.1 3.8 1.6v3.6c0 .7-.6 1.3-1.3 1.3A11.8 11.8 0 0 1 6.9 5.8c0-.7.6-1.3 1.3-1.3z" />
    </svg>
  );
}
