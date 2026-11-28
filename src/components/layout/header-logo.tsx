"use client";

import Link from "next/link";
import { useReservationChat } from "@/components/reservation-chat/reservation-chat-context";
import { brandLogos } from "@/lib/brand-assets";
import { routes } from "@/lib/routes";

const LOGO_HEIGHT = "1.68rem";
const SYMBOL_HEIGHT = `calc(${LOGO_HEIGHT} * 1.235)`;

export function HeaderLogo() {
  const { activeChat } = useReservationChat();
  const statusLabel = activeChat
    ? `${activeChat.spaceName} 예약챗 진행중`
    : null;

  return (
    <Link
      href={routes.spaceList}
      className="inline-flex h-10 min-w-0 max-w-full shrink-0 items-center gap-1.5"
      aria-label={statusLabel ?? "rsvd 홈"}
    >
      {statusLabel ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brandLogos.symbol}
            alt="rsvd"
            width={800}
            height={800}
            className="w-auto shrink-0 translate-y-px"
            style={{ height: SYMBOL_HEIGHT }}
          />
          <span className="min-w-0 truncate text-sm font-normal leading-none text-rsvd-text-muted">
            {statusLabel}
          </span>
        </>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={brandLogos.main}
          alt="rsvd"
          width={1800}
          height={800}
          className="w-auto shrink-0"
          style={{ height: LOGO_HEIGHT }}
        />
      )}
    </Link>
  );
}
