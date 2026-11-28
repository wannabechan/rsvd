"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { useReservationChat } from "@/components/reservation-chat/reservation-chat-context";
import { brandLogos } from "@/lib/brand-assets";
import { isSpaceDetailPathname, routes } from "@/lib/routes";

const SWAP_INTERVAL_MS = 5000;
const DISSOLVE_MS = 700;
const LOGO_HEIGHT = "1.68rem";
const SYMBOL_HEIGHT = `calc(${LOGO_HEIGHT} * 1.235)`;
const LOGO_SLOT_WIDTH = `calc(${LOGO_HEIGHT} * 1800 / 800)`;
const START_CHAT_LABEL = "을 눌러 예약챗을 시작하세요.";

export function HeaderLogo() {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();
  const { activeChat } = useReservationChat();
  const [showSymbol, setShowSymbol] = useState(false);
  const isChatActive = Boolean(activeChat);
  const onSpaceDetail = isSpaceDetailPathname(pathname);
  // Space detail + active chat pin the symbol; idle dissolve only when logged out.
  const pinSymbol = isChatActive || onSpaceDetail;
  const displaySymbol = pinSymbol || (!isLoggedIn && showSymbol);
  const statusLabel = isChatActive
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

  return (
    <Link
      href={routes.spaceList}
      className="relative inline-flex shrink-0 items-center"
      style={{ height: SYMBOL_HEIGHT, width: LOGO_SLOT_WIDTH }}
      aria-label={
        isChatActive
          ? statusLabel
          : displaySymbol
            ? "예약챗 시작하기"
            : "rsvd 홈"
      }
    >
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
          height: LOGO_HEIGHT,
          transitionDuration: instantSwap ? "0ms" : `${DISSOLVE_MS}ms`,
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={brandLogos.symbol}
        alt=""
        width={800}
        height={800}
        className={`absolute top-1/2 left-0 w-auto -translate-y-[calc(50%-2px)] transition-opacity ease-in-out ${
          displaySymbol ? "opacity-100" : "opacity-0"
        }`}
        style={{
          height: SYMBOL_HEIGHT,
          transitionDuration: instantSwap ? "0ms" : `${DISSOLVE_MS}ms`,
        }}
        aria-hidden="true"
      />
      <span
        className={`pointer-events-none absolute top-1/2 max-w-[min(16.5rem,calc(100vw-7.5rem))] -translate-y-[calc(50%-2px)] truncate text-sm font-normal leading-none text-rsvd-text-muted transition-opacity ease-in-out ${
          showStatusLabel ? "opacity-100" : "opacity-0"
        }`}
        style={{
          left: `calc(${SYMBOL_HEIGHT} + 0.4rem)`,
          transitionDuration: instantSwap ? "0ms" : `${DISSOLVE_MS}ms`,
        }}
        aria-hidden={!showStatusLabel}
      >
        {statusLabel}
      </span>
    </Link>
  );
}
