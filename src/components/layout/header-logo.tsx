"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { useReservationChat } from "@/components/reservation-chat/reservation-chat-context";
import { brandLogos } from "@/lib/brand-assets";
import {
  HEADER_LOGO_HEIGHT,
  HEADER_LOGO_SLOT_WIDTH,
  HEADER_SYMBOL_HEIGHT,
  HEADER_SYMBOL_NUDGE_Y,
} from "@/lib/header-logo-layout";
import { isSpaceDetailPathname, routes } from "@/lib/routes";

const SWAP_INTERVAL_MS = 5000;
const DISSOLVE_MS = 700;
const START_CHAT_LABEL = "을 눌러 예약챗을 시작하세요.";

export function HeaderLogo() {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();
  const { activeChat, detailSpace, startChat } = useReservationChat();
  const [showSymbol, setShowSymbol] = useState(false);
  const isChatActive = Boolean(activeChat);
  const onSpaceDetail = isSpaceDetailPathname(pathname);
  // Space detail + active chat pin the symbol; idle dissolve only when logged out.
  const pinSymbol = isChatActive || onSpaceDetail;
  const displaySymbol = pinSymbol || (!isLoggedIn && showSymbol);
  const statusLabel = activeChat
    ? `${activeChat.spaceName} 예약챗 진행중`
    : START_CHAT_LABEL;
  const showStatusLabel = displaySymbol;
  const instantSwap = pinSymbol;

  useEffect(() => {
    if (pinSymbol || isLoggedIn) {
      setShowSymbol(false);
      return;
    }

    setShowSymbol(false);
    const timer = window.setInterval(() => {
      setShowSymbol((current) => !current);
    }, SWAP_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [pinSymbol, isLoggedIn]);

  const slotStyle = {
    height: HEADER_SYMBOL_HEIGHT,
    width: HEADER_LOGO_SLOT_WIDTH,
  } as const;

  const visuals: ReactNode = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={brandLogos.main}
        alt="rsvd"
        width={1800}
        height={800}
        className={`absolute top-1/2 left-0 w-auto -translate-y-1/2 transition-opacity ease-in-out ${
          displaySymbol ? "opacity-0" : "opacity-100"
        }`}
        style={{
          height: HEADER_LOGO_HEIGHT,
          transitionDuration: instantSwap ? "0ms" : `${DISSOLVE_MS}ms`,
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={brandLogos.symbol}
        alt=""
        width={800}
        height={800}
        className={`absolute top-1/2 left-0 w-auto transition-opacity ease-in-out ${
          displaySymbol ? "opacity-100" : "opacity-0"
        }`}
        style={{
          height: HEADER_SYMBOL_HEIGHT,
          transform: `translateY(calc(-50% + ${HEADER_SYMBOL_NUDGE_Y}))`,
          transitionDuration: instantSwap ? "0ms" : `${DISSOLVE_MS}ms`,
        }}
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute top-1/2 max-w-[min(16.5rem,calc(100vw-7.5rem))] truncate text-sm font-normal leading-none text-rsvd-text-muted transition-opacity ease-in-out"
        style={{
          left: `calc(${HEADER_SYMBOL_HEIGHT} + 0.4rem)`,
          transform: `translateY(calc(-50% + ${HEADER_SYMBOL_NUDGE_Y}))`,
          opacity: showStatusLabel ? 1 : 0,
          transitionDuration: instantSwap ? "0ms" : `${DISSOLVE_MS}ms`,
        }}
        aria-hidden={!showStatusLabel}
      >
        {statusLabel}
      </span>
    </>
  );

  // Space detail: same action as the messenger CTA (start reservation chat).
  if (onSpaceDetail) {
    return (
      <button
        type="button"
        className="relative inline-flex shrink-0 items-center"
        style={slotStyle}
        aria-label={
          isChatActive
            ? statusLabel
            : detailSpace
              ? `${detailSpace.spaceName} 메신저 예약`
              : "예약챗 시작하기"
        }
        onClick={() => {
          if (detailSpace) {
            startChat(detailSpace);
          }
        }}
      >
        {visuals}
      </button>
    );
  }

  return (
    <Link
      href={routes.spaceList}
      className="relative inline-flex shrink-0 items-center"
      style={slotStyle}
      aria-label={
        isChatActive
          ? statusLabel
          : displaySymbol
            ? "예약챗 시작하기"
            : "rsvd 홈"
      }
    >
      {visuals}
    </Link>
  );
}
