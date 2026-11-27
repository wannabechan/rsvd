"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/auth-context";
import { HeaderLogo } from "@/components/layout/header-logo";
import { useReservationChat } from "@/components/reservation-chat/reservation-chat-context";
import {
  avatarToneForEmail,
  emailInitial,
  emailLocalPart,
} from "@/domain/auth";
import { routes } from "@/lib/routes";

const HEADER_ICON_CLASS = "h-[1.65rem] w-[1.65rem]";

export function SiteHeader() {
  const { user, isLoggedIn } = useAuth();
  const { activeChat, endChat } = useReservationChat();

  return (
    <header className="relative z-50 shrink-0">
      <div className="flex w-full items-center justify-between border-b border-rsvd-border bg-rsvd-surface px-4 py-4">
        <HeaderLogo />

        <nav className="ml-auto flex min-w-0 items-center">
          {activeChat ? (
            <button
              type="button"
              aria-label="예약챗 닫기"
              onClick={endChat}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-rsvd-text transition hover:bg-rsvd-tint"
            >
              <CloseIcon />
            </button>
          ) : isLoggedIn && user ? (
            <Link
              href={routes.profile}
              aria-label="프로필"
              className="inline-flex min-w-0 max-w-[11rem] items-center gap-2 rounded-full py-1 pl-1 pr-0.5 transition hover:bg-rsvd-tint"
            >
              <span className="min-w-0 truncate text-sm font-normal text-rsvd-text">
                {emailLocalPart(user.email)}
              </span>
              <UserAvatar email={user.email} />
            </Link>
          ) : (
            <Link
              href={routes.login}
              className="inline-flex h-10 translate-y-[2px] items-center justify-center px-0 text-sm font-normal text-rsvd-text"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function UserAvatar({ email }: { email: string }) {
  const tone = avatarToneForEmail(email);
  const initial = emailInitial(email);

  return (
    <span
      aria-hidden="true"
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium leading-none"
      style={{ backgroundColor: tone.background, color: tone.foreground }}
    >
      {initial}
    </span>
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
