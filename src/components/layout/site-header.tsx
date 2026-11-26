import Link from "next/link";

const HEADER_ICON_CLASS = "h-[1.65rem] w-[1.65rem]";

export function SiteHeader() {
  const isLoggedIn = false;

  return (
    <header className="relative z-50 shrink-0">
      <div className="flex w-full items-center justify-between border-b border-rsvd-border bg-rsvd-surface px-4 py-4">
        <Link href="/space" className="inline-flex shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/rsvd_logo_main.png"
            alt="rsvd"
            width={1800}
            height={800}
            className="h-[1.68rem] w-auto"
          />
        </Link>

        <nav className="ml-auto flex items-center">
          {isLoggedIn ? (
            <button
              type="button"
              aria-label="프로필"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-rsvd-text transition hover:bg-rsvd-tint"
            >
              <ProfileIcon />
            </button>
          ) : (
            <button
              type="button"
              className="inline-flex h-10 translate-y-[2px] items-center justify-center px-0 text-sm font-normal text-rsvd-text"
            >
              로그인
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

function ProfileIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={HEADER_ICON_CLASS}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path strokeLinecap="round" d="M6.5 19.5c.9-2.8 3.2-4.5 5.5-4.5s4.6 1.7 5.5 4.5" />
    </svg>
  );
}
