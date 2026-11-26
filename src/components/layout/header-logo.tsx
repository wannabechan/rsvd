"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useReservationChat } from "@/components/reservation-chat/reservation-chat-context";

const SWAP_INTERVAL_MS = 5000;
const DISSOLVE_MS = 700;
const LOGO_HEIGHT = "1.68rem";
const SYMBOL_SCALE = 1.235;
const SYMBOL_HEIGHT = `calc(${LOGO_HEIGHT} * ${SYMBOL_SCALE})`;
const LOGO_SLOT_WIDTH = `calc(${LOGO_HEIGHT} * 1800 / 800)`;

export function HeaderLogo() {
  const { activeChat } = useReservationChat();
  const [showSymbol, setShowSymbol] = useState(false);
  const isChatActive = Boolean(activeChat);
  const displaySymbol = isChatActive || showSymbol;

  useEffect(() => {
    if (isChatActive) {
      setShowSymbol(true);
      return;
    }

    const timer = window.setInterval(() => {
      setShowSymbol((current) => !current);
    }, SWAP_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [isChatActive]);

  const statusLabel = activeChat
    ? `${activeChat.spaceName} 예약챗 진행중`
    : "를 눌러 예약챗을 시작하세요.";

  return (
    <Link
      href="/space"
      className="relative inline-flex shrink-0 items-center"
      style={{ height: SYMBOL_HEIGHT, width: LOGO_SLOT_WIDTH }}
      aria-label={
        activeChat
          ? statusLabel
          : displaySymbol
            ? "예약챗 시작하기"
            : "rsvd 홈"
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/img/rsvd_logo_main.png"
        alt="rsvd"
        width={1800}
        height={800}
        className={`absolute top-1/2 left-0 w-auto -translate-y-1/2 transition-opacity ease-in-out ${
          displaySymbol ? "opacity-0" : "opacity-100"
        }`}
        style={{
          height: LOGO_HEIGHT,
          transitionDuration: isChatActive ? "0ms" : `${DISSOLVE_MS}ms`,
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/img/rsvd_logo_symbol.png"
        alt=""
        width={800}
        height={800}
        className={`absolute top-1/2 left-0 w-auto -translate-y-[calc(50%-2px)] transition-opacity ease-in-out ${
          displaySymbol ? "opacity-100" : "opacity-0"
        }`}
        style={{
          height: SYMBOL_HEIGHT,
          transitionDuration: isChatActive ? "0ms" : `${DISSOLVE_MS}ms`,
        }}
        aria-hidden="true"
      />
      <span
        className={`pointer-events-none absolute top-1/2 max-w-[min(16.5rem,calc(100vw-7.5rem))] -translate-y-[calc(50%-2px)] truncate text-sm font-normal leading-none text-rsvd-text-muted transition-opacity ease-in-out ${
          displaySymbol ? "opacity-100" : "opacity-0"
        }`}
        style={{
          left: `calc(${SYMBOL_HEIGHT} + 0.4rem)`,
          transitionDuration: isChatActive ? "0ms" : `${DISSOLVE_MS}ms`,
        }}
        aria-hidden={!displaySymbol}
      >
        {statusLabel}
      </span>
    </Link>
  );
}
