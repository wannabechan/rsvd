"use client";

import Link from "next/link";
import { useState } from "react";
import { IconCopy, IconPlus } from "@/components/admin/admin-icons";
import {
  createEmptySlot,
  formatSlotSummary,
  WEEKDAY_KEYS,
  WEEKDAY_LABELS,
  type AdminSpace,
  type TimeSlot,
  type WeekdayKey,
} from "@/domain/admin-space";
import { routes } from "@/lib/routes";

type AdminHoursEditorProps = {
  space: AdminSpace;
};

export function AdminHoursEditor({ space }: AdminHoursEditorProps) {
  const [weeklyHours, setWeeklyHours] = useState(space.weeklyHours);

  function addSlot(day: WeekdayKey) {
    setWeeklyHours((current) => ({
      ...current,
      [day]: {
        slots: [...current[day].slots, createEmptySlot()],
      },
    }));
  }

  function removeSlot(day: WeekdayKey, slotId: string) {
    setWeeklyHours((current) => ({
      ...current,
      [day]: {
        slots: current[day].slots.filter((slot) => slot.id !== slotId),
      },
    }));
  }

  function copyFromPrevious(day: WeekdayKey) {
    const index = WEEKDAY_KEYS.indexOf(day);
    if (index <= 0) {
      return;
    }
    const previous = WEEKDAY_KEYS[index - 1];
    setWeeklyHours((current) => ({
      ...current,
      [day]: {
        slots: current[previous].slots.map((slot) => ({
          ...slot,
          id: `${day}-${slot.id}-${Date.now()}`,
        })),
      },
    }));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-lg font-medium text-rsvd-text">
          시간설정{" "}
          <span className="font-normal text-rsvd-text-muted">/ {space.name}</span>
        </h1>
        <Link
          href={routes.adminSpaces}
          className="text-sm text-rsvd-text-muted transition hover:text-rsvd-brand"
        >
          ← 공간 목록
        </Link>
      </div>

      <div className="space-y-4">
        {WEEKDAY_KEYS.map((day) => (
          <DayCard
            key={day}
            day={day}
            slots={weeklyHours[day].slots}
            onAdd={() => addSlot(day)}
            onRemove={(slotId) => removeSlot(day, slotId)}
            onCopy={day === "mon" ? undefined : () => copyFromPrevious(day)}
          />
        ))}
      </div>
    </div>
  );
}

function DayCard({
  day,
  slots,
  onAdd,
  onRemove,
  onCopy,
}: {
  day: WeekdayKey;
  slots: TimeSlot[];
  onAdd: () => void;
  onRemove: (slotId: string) => void;
  onCopy?: () => void;
}) {
  return (
    <section className="rounded-2xl border border-rsvd-border bg-rsvd-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-rsvd-text">
            {WEEKDAY_LABELS[day]}
          </h2>
          {onCopy ? (
            <button
              type="button"
              aria-label="이전 요일 복사"
              onClick={onCopy}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-rsvd-text-muted hover:bg-rsvd-bg hover:text-rsvd-text"
            >
              <IconCopy />
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-rsvd-border bg-rsvd-surface px-3 text-sm text-rsvd-text transition hover:bg-rsvd-bg"
        >
          <IconPlus className="h-3.5 w-3.5" />
          시간대 추가
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {slots.length === 0 ? (
          <p className="rounded-xl bg-rsvd-bg px-3 py-3 text-sm text-rsvd-text-muted">
            등록된 시간대가 없습니다.
          </p>
        ) : (
          slots.map((slot) => (
            <div
              key={slot.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rsvd-border bg-rsvd-surface px-3 py-2.5"
            >
              <p className="text-sm text-rsvd-text">{formatSlotSummary(slot)}</p>
              <button
                type="button"
                onClick={() => onRemove(slot.id)}
                className="text-sm font-medium text-rsvd-danger"
              >
                삭제
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          className="inline-flex h-9 items-center justify-center rounded-full bg-rsvd-brand px-4 text-sm font-medium text-rsvd-on-brand transition hover:bg-rsvd-brand-strong"
        >
          저장
        </button>
      </div>
    </section>
  );
}
