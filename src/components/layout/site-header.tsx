"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import { useLoginBoot } from "@/components/auth/login-boot-context";
import { UserAvatar } from "@/components/auth/user-avatar";
import { HeaderLogo } from "@/components/layout/header-logo";
import { useReservationChat } from "@/components/reservation-chat/reservation-chat-context";
import { routes } from "@/lib/routes";

const HEADER_ICON_CLASS = "h-[1.65rem] w-[1.65rem]";

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { bumpLoginBoot } = useLoginBoot();
  const { user, isLoggedIn } = useAuth();
  const { activeChat, endChat } = useReservationChat();

  function openInitialLogin() {
    // Bump remounts LoginForm to the email step even if /login was cached.
    bumpLoginBoot();
    if (pathname !== routes.login) {
      router.push(routes.login);
    }
  }

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
              className="inline-flex items-center rounded-full"
            >
              <UserAvatar user={user} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={openInitialLogin}
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
