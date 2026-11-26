"use client";

import { HeaderLogo } from "@/components/layout/header-logo";
import { useReservationChat } from "@/components/reservation-chat/reservation-chat-context";

const HEADER_ICON_CLASS = "h-[1.65rem] w-[1.65rem]";

export function SiteHeader() {
  const { activeChat, endChat } = useReservationChat();
  const isLoggedIn = false;

  return (
    <header className="relative z-50 shrink-0">
      <div className="flex w-full items-center justify-between border-b border-rsvd-border bg-rsvd-surface px-4 py-4">
        <HeaderLogo />

        <nav className="ml-auto flex items-center">
          {activeChat ? (
            <button
              type="button"
              aria-label="예약챗 닫기"
              onClick={endChat}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-rsvd-text transition hover:bg-rsvd-tint"
            >
              <CloseIcon />
            </button>
          ) : isLoggedIn ? (
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

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={HEADER_ICON_CLASS}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
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
