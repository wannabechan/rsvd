"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const MENU_PANEL_HEIGHT = "calc(100dvh - 4.5rem)";
const MENU_DROP_ANIMATION =
  "nav-menu-drop 0.22s cubic-bezier(0.22, 1, 0.36, 1) forwards";
const HEADER_ICON_CLASS = "h-[1.65rem] w-[1.65rem]";
const NAV_FOOTER_LINK_CLASS =
  "text-sm font-normal text-rsvd-text transition hover:text-rsvd-text-muted";

export function SiteHeader() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const isLoggedIn = false;

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleProfileClick = () => {
    closeMenu();
    router.push(isLoggedIn ? "/profile" : "/login?callbackUrl=/profile");
  };

  return (
    <header className="relative z-50 shrink-0">
      <div className="flex w-full items-center justify-between border-b border-rsvd-border bg-rsvd-surface px-4 py-4">
        <Link href="/space" className="inline-flex shrink-0" onClick={closeMenu}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
            src="/img/rsvd_logo_main.png"
            alt="rsvd"
            width={1800}
            height={800}
            className="h-[1.4rem] w-auto"
          />
        </Link>

        <nav className="flex items-center gap-1">
          <button
            type="button"
            aria-label={isLoggedIn ? "프로필로 이동" : "로그인으로 이동"}
            onClick={handleProfileClick}
            className="inline-flex h-10 w-10 translate-x-[7px] items-center justify-center rounded-full text-rsvd-text transition hover:bg-rsvd-tint"
          >
            <ProfileIcon />
          </button>

          <button
            type="button"
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-rsvd-text transition hover:bg-rsvd-tint"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </nav>
      </div>

      {menuOpen ? (
        <div
          className="absolute inset-x-0 top-full z-40 overflow-hidden"
          style={{ height: MENU_PANEL_HEIGHT }}
        >
          <div
            className="flex h-full flex-col bg-rsvd-surface px-6 pt-10 pb-6"
            style={{ animation: MENU_DROP_ANIMATION }}
          >
            <nav className="flex flex-col items-start gap-[13px]" aria-label="메인 메뉴" />

            <div className="mt-auto flex w-full items-end justify-between gap-3">
              <Link
                href="/login"
                onClick={closeMenu}
                className={NAV_FOOTER_LINK_CLASS}
              >
                로그인
              </Link>
            </div>
          </div>
        </div>
      ) : null}
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

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={HEADER_ICON_CLASS}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path strokeLinecap="round" d="M5 7h14M5 12h14M5 17h14" />
    </svg>
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
    >
      <path strokeLinecap="round" d="M7 7l10 10M17 7 7 17" />
    </svg>
  );
}
