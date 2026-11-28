"use client";

import { brandLogos } from "@/lib/brand-assets";
import {
  HEADER_SYMBOL_HEIGHT,
  HEADER_SYMBOL_NUDGE_Y,
} from "@/lib/header-logo-layout";
import {
  DEFAULT_PROFILE_HEADER_MODE,
  PROFILE_HEADER_MODE_LABEL,
  type ProfileHeaderMode,
} from "@/domain/profile-header-modes";

const MODE_ICON: Record<ProfileHeaderMode, string> = {
  symbol: brandLogos.symbol,
  calendar: brandLogos.symbolCalendar,
  setting: brandLogos.symbolSetting,
  lock: brandLogos.symbolLock,
  manager: brandLogos.symbolManager,
  admin: brandLogos.symbolAdmin,
};

type ProfileHeaderModesProps = {
  modes: readonly ProfileHeaderMode[];
  selected: ProfileHeaderMode;
  onSelect: (mode: ProfileHeaderMode) => void;
};

export function ProfileHeaderModes({
  modes,
  selected,
  onSelect,
}: ProfileHeaderModesProps) {
  const active = modes.includes(selected)
    ? selected
    : DEFAULT_PROFILE_HEADER_MODE;

  return (
    <div
      className="flex h-10 min-w-0 items-center gap-[19px]"
      role="tablist"
      aria-label="프로필 모드"
    >
      {modes.map((mode) => {
        const isSelected = mode === active;
        return (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-label={PROFILE_HEADER_MODE_LABEL[mode]}
            onClick={() => {
              onSelect(mode);
            }}
            className="relative inline-flex h-10 shrink-0 items-center justify-start"
            style={{ width: HEADER_SYMBOL_HEIGHT }}
          >
            {isSelected ? (
              <span
                className="pointer-events-none absolute top-0 left-1/2 z-10 h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-rsvd-brand"
                aria-hidden="true"
              />
            ) : null}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={MODE_ICON[mode]}
              alt=""
              width={800}
              height={800}
              className="absolute top-1/2 left-0 w-auto"
              style={{
                height: HEADER_SYMBOL_HEIGHT,
                transform: `translateY(calc(-50% + ${HEADER_SYMBOL_NUDGE_Y}))`,
              }}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}
