"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const SWAP_INTERVAL_MS = 3000;
const DISSOLVE_MS = 700;
const LOGO_HEIGHT = "1.68rem";
const LOGO_SLOT_WIDTH = `calc(${LOGO_HEIGHT} * 1800 / 800)`;
const SYMBOL_WIDTH = LOGO_HEIGHT;

export function HeaderLogo() {
  const [showSymbol, setShowSymbol] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setShowSymbol((current) => !current);
    }, SWAP_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return (
    <Link
      href="/space"
      className="relative inline-flex shrink-0 items-center"
      style={{ height: LOGO_HEIGHT, width: LOGO_SLOT_WIDTH }}
      aria-label={showSymbol ? "예약챗 시작하기" : "rsvd 홈"}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/img/rsvd_logo_main.png"
        alt="rsvd"
        width={1800}
        height={800}
        className={`absolute top-0 left-0 h-full w-auto transition-opacity ease-in-out ${
          showSymbol ? "opacity-0" : "opacity-100"
        }`}
        style={{ transitionDuration: `${DISSOLVE_MS}ms` }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/img/rsvd_logo_symbol.png"
        alt=""
        width={800}
        height={800}
        className={`absolute top-0 left-0 h-full w-auto transition-opacity ease-in-out ${
          showSymbol ? "opacity-100" : "opacity-0"
        }`}
        style={{ transitionDuration: `${DISSOLVE_MS}ms` }}
        aria-hidden="true"
      />
      <span
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[0.7rem] leading-none text-rsvd-text-muted transition-opacity ease-in-out ${
          showSymbol ? "opacity-100" : "opacity-0"
        }`}
        style={{
          left: `calc(${SYMBOL_WIDTH} + 0.4rem)`,
          transitionDuration: `${DISSOLVE_MS}ms`,
        }}
        aria-hidden={!showSymbol}
      >
        를 눌러 예약챗을 시작하세요.
      </span>
    </Link>
  );
}
