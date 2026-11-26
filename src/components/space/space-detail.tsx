import type { SpaceItem, SpaceNoticeBlock } from "@/data/spaces";

type SpaceDetailProps = {
  space: SpaceItem;
};

export function SpaceDetail({ space }: SpaceDetailProps) {
  const phoneHref = normalizePhoneHref(space.contact);

  return (
    <article className="px-4 pb-10 pt-4">
      <div className="relative overflow-hidden rounded-2xl">
        {space.thumbnailImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={space.thumbnailImage}
            alt={space.name}
            className="aspect-[4/5] w-full object-cover"
          />
        ) : (
          <div aria-hidden="true" className="aspect-[4/5] w-full bg-rsvd-tint" />
        )}

        {phoneHref ? (
          <a
            href={phoneHref}
            aria-label={`${space.name}에 전화하기`}
            className="absolute top-3 right-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-rsvd-surface/90 text-rsvd-text shadow-sm backdrop-blur-sm transition hover:bg-rsvd-surface"
          >
            <PhoneIcon />
          </a>
        ) : (
          <button
            type="button"
            disabled
            aria-label="연락처 없음"
            className="absolute top-3 right-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-rsvd-surface/90 text-rsvd-border shadow-sm backdrop-blur-sm"
          >
            <PhoneIcon />
          </button>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <h1 className="min-w-0 text-[1.18125rem] font-medium break-words text-rsvd-text">
          {space.name}
        </h1>
        <button
          type="button"
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
        </button>
      </div>

      <p className="mt-2 text-[0.84rem] font-bold break-words text-rsvd-text">{space.address}</p>

      <section className="mt-5 space-y-3" aria-label="매장 공지사항">
        <h2 className="text-sm font-medium text-rsvd-text">공지사항</h2>
        <div className="space-y-3 text-sm leading-relaxed text-rsvd-text-muted">
          {space.notice.map((block, index) => (
            <NoticeBlock key={`${space.id}-notice-${index}`} block={block} />
          ))}
        </div>
      </section>
    </article>
  );
}

function NoticeBlock({ block }: { block: SpaceNoticeBlock }) {
  if (block.type === "paragraph") {
    return <p>{block.text}</p>;
  }

  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {block.items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function normalizePhoneHref(contact: string) {
  const digits = contact.replace(/\D/g, "");
  return digits ? `tel:${digits}` : "";
}

function PhoneIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
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
