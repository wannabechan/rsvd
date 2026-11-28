"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { IconNotice } from "@/components/admin/admin-icons";
import { useAuth } from "@/components/auth/auth-context";
import { useLoginBoot } from "@/components/auth/login-boot-context";
import {
  hasPrivilegeAvatarRing,
  UserAvatar,
} from "@/components/auth/user-avatar";
import { HeaderLogo } from "@/components/layout/header-logo";
import { OwnerVerifyModal } from "@/components/profile/owner-verify-modal";
import { useReservationChat } from "@/components/reservation-chat/reservation-chat-context";
import { routes } from "@/lib/routes";

const HEADER_ICON_CLASS = "h-[1.65rem] w-[1.65rem]";
/** Same type style as header nickname beside the avatar. */
const PROFILE_MODE_LINK_CLASS =
  "inline-flex h-10 items-center px-0 text-sm font-normal text-rsvd-text transition hover:text-rsvd-brand";

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { bumpLoginBoot } = useLoginBoot();
  const { user, isLoggedIn } = useAuth();
  const { activeChat, endChat } = useReservationChat();
  const onProfile = pathname === routes.profile;
  const needsOwnerVerify = Boolean(
    isLoggedIn && user?.canOwnerVerify && !user?.ownerVerified,
  );
  const showAdminPageLink = user?.role === "admin";
  const showOwnerPageLink = Boolean(user?.ownerVerified);
  const showOwnerVerifyLink = Boolean(
    user?.canOwnerVerify && !user?.ownerVerified,
  );
  const showProfileModeLinks =
    showAdminPageLink || showOwnerPageLink || showOwnerVerifyLink;
  const [ownerVerifyOpen, setOwnerVerifyOpen] = useState(false);

  function openInitialLogin() {
    // Bump remounts LoginForm to the email step even if /login was cached.
    bumpLoginBoot();
    if (pathname !== routes.login) {
      router.push(routes.login);
    }
  }

  function leaveProfile() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.replace(routes.spaceList);
  }

  return (
    <header className="relative z-50 shrink-0">
      {/* Fixed action row (h-10) + py-4 keeps header height identical across modes. */}
      <div
        className={`flex h-[4.5rem] w-full items-center justify-between border-b border-rsvd-border px-4 ${
          onProfile ? "bg-rsvd-bg" : "bg-rsvd-surface"
        }`}
      >
        <div className="flex h-10 min-w-0 items-center">
          {onProfile && showProfileModeLinks ? (
            <div className="flex h-10 min-w-0 items-center gap-3">
              {showAdminPageLink ? (
                <button
                  type="button"
                  onClick={() => {
                    router.push(routes.admin);
                  }}
                  className={PROFILE_MODE_LINK_CLASS}
                >
                  {">>"} 관리자페이지
                </button>
              ) : null}
              {showOwnerPageLink ? (
                <button
                  type="button"
                  onClick={() => {
                    // 사장님페이지 — host dashboard wired later.
                  }}
                  className={PROFILE_MODE_LINK_CLASS}
                >
                  {">>"} 사장님페이지
                </button>
              ) : showOwnerVerifyLink ? (
                <button
                  type="button"
                  onClick={() => setOwnerVerifyOpen(true)}
                  className={PROFILE_MODE_LINK_CLASS}
                >
                  {">>"} 사장님인증
                </button>
              ) : null}
            </div>
          ) : needsOwnerVerify ? (
            <button
              type="button"
              onClick={() => setOwnerVerifyOpen(true)}
              className="owner-verify-notice inline-flex h-10 min-w-0 max-w-full items-center gap-1.5 text-left text-sm font-normal text-rsvd-text"
              aria-label="사장님 인증을 진행하세요."
            >
              <IconNotice className="h-4 w-4 shrink-0" />
              <span className="min-w-0 truncate">사장님 인증을 진행하세요.</span>
            </button>
          ) : (
            <HeaderLogo />
          )}
        </div>

        <nav className="ml-auto flex h-10 min-w-0 items-center">
          {activeChat ? (
            <button
              type="button"
              aria-label="예약챗 닫기"
              onClick={endChat}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-rsvd-text transition hover:bg-rsvd-tint"
            >
              <CloseIcon />
            </button>
          ) : onProfile ? (
            <button
              type="button"
              aria-label="프로필 닫기"
              onClick={leaveProfile}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-rsvd-text transition hover:bg-rsvd-tint"
            >
              <CloseIcon />
            </button>
          ) : isLoggedIn && user ? (
            <Link
              href={routes.profile}
              aria-label="프로필"
              className="inline-flex h-10 max-w-[11rem] items-center gap-2 rounded-full"
            >
              <span
                className={`min-w-0 truncate text-sm font-normal text-rsvd-text ${
                  hasPrivilegeAvatarRing(user) ? "-translate-x-[3px]" : ""
                }`}
              >
                {user.nickname}
              </span>
              <UserAvatar user={user} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={openInitialLogin}
              className="inline-flex h-10 items-center justify-center px-0 text-sm font-normal text-rsvd-text"
            >
              로그인
            </button>
          )}
        </nav>
      </div>

      {ownerVerifyOpen ? (
        <OwnerVerifyModal
          onClose={() => setOwnerVerifyOpen(false)}
          onVerified={() => setOwnerVerifyOpen(false)}
        />
      ) : null}
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
