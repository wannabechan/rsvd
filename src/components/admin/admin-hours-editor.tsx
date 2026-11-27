"use client";

import Link from "next/link";
import { useState } from "react";
import { IconCopy, IconPlus } from "@/components/admin/admin-icons";
import {
  cloneDaySlots,
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

function slotsEqual(a: TimeSlot[], b: TimeSlot[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function AdminHoursEditor({ space }: AdminHoursEditorProps) {
  const [savedHours, setSavedHours] = useState(space.weeklyHours);
  const [draftHours, setDraftHours] = useState(space.weeklyHours);
  const [error, setError] = useState<string | null>(null);
  const [savingDay, setSavingDay] = useState<WeekdayKey | null>(null);

  function updateDaySlots(day: WeekdayKey, slots: TimeSlot[]) {
    setDraftHours((current) => ({
      ...current,
      [day]: { slots },
    }));
  }

  function copyFromPrevious(day: WeekdayKey) {
    const index = WEEKDAY_KEYS.indexOf(day);
    if (index <= 0) {
      return;
    }
    const previous = WEEKDAY_KEYS[index - 1];
    updateDaySlots(day, cloneDaySlots(draftHours[previous].slots, day));
  }

  async function saveDay(day: WeekdayKey) {
    setError(null);
    setSavingDay(day);
    try {
      const response = await fetch(`/api/admin/spaces/${space.id}/hours`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          day,
          slots: draftHours[day].slots,
        }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        space?: AdminSpace;
      };
      if (!response.ok || !data.ok || !data.space) {
        setError(data.error ?? "저장에 실패했습니다.");
        setSavingDay(null);
        return;
      }
      setSavedHours(data.space.weeklyHours);
      setDraftHours(data.space.weeklyHours);
      setSavingDay(null);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
      setSavingDay(null);
    }
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

      {error ? (
        <p className="mb-4 text-sm text-rsvd-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="space-y-4">
        {WEEKDAY_KEYS.map((day) => (
          <DayCard
            key={day}
            day={day}
            slots={draftHours[day].slots}
            dirty={!slotsEqual(draftHours[day].slots, savedHours[day].slots)}
            saving={savingDay === day}
            onChangeSlots={(slots) => updateDaySlots(day, slots)}
            onCopy={day === "mon" ? undefined : () => copyFromPrevious(day)}
            onSave={() => {
              void saveDay(day);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function DayCard({
  day,
  slots,
  dirty,
  saving,
  onChangeSlots,
  onCopy,
  onSave,
}: {
  day: WeekdayKey;
  slots: TimeSlot[];
  dirty: boolean;
  saving: boolean;
  onChangeSlots: (slots: TimeSlot[]) => void;
  onCopy?: () => void;
  onSave: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<TimeSlot>(() => createEmptySlot());

  function openAddForm() {
    setDraft(createEmptySlot());
    setAdding(true);
  }

  function cancelAdd() {
    setAdding(false);
  }

  function confirmAdd() {
    onChangeSlots([...slots, { ...draft, extraBufferDays: 0 }]);
    setAdding(false);
  }

  function removeSlot(slotId: string) {
    onChangeSlots(slots.filter((slot) => slot.id !== slotId));
  }

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
          onClick={openAddForm}
          disabled={adding}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-rsvd-border bg-rsvd-surface px-3 text-sm text-rsvd-text transition hover:bg-rsvd-bg disabled:border-rsvd-disabled-bg disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
        >
          <IconPlus className="h-3.5 w-3.5" />
          시간대 추가
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {slots.length === 0 && !adding ? (
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
                onClick={() => removeSlot(slot.id)}
                className="text-sm font-medium text-rsvd-danger"
              >
                삭제
              </button>
            </div>
          ))
        )}

        {adding ? (
          <div className="rounded-xl border border-rsvd-border bg-rsvd-bg p-3">
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-sm text-rsvd-text">시작시간</span>
                <input
                  type="time"
                  value={draft.start}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      start: event.target.value,
                    }))
                  }
                  className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-rsvd-text">끝시간</span>
                <input
                  type="time"
                  value={draft.end}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      end: event.target.value,
                    }))
                  }
                  className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-rsvd-text">
                  예약시간간격 (분)
                </span>
                <input
                  type="number"
                  min={1}
                  value={draft.intervalMinutes}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      intervalMinutes: Number(event.target.value) || 1,
                    }))
                  }
                  className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-rsvd-text">예약허용횟수</span>
                <input
                  type="number"
                  min={1}
                  value={draft.maxReservations}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      maxReservations: Number(event.target.value) || 1,
                    }))
                  }
                  className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text"
                />
              </label>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelAdd}
                className="inline-flex h-9 items-center justify-center rounded-full border border-rsvd-border bg-rsvd-surface px-4 text-sm font-medium text-rsvd-text transition hover:bg-rsvd-bg"
              >
                취소
              </button>
              <button
                type="button"
                onClick={confirmAdd}
                disabled={!draft.start || !draft.end}
                className="inline-flex h-9 items-center justify-center rounded-full bg-rsvd-brand px-4 text-sm font-medium text-rsvd-on-brand transition hover:bg-rsvd-brand-strong disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
              >
                추가
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          disabled={!dirty || saving || adding}
          onClick={onSave}
          className="inline-flex h-9 items-center justify-center rounded-full bg-rsvd-brand px-4 text-sm font-medium text-rsvd-on-brand transition hover:bg-rsvd-brand-strong disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
        >
          {saving ? "…" : "저장"}
        </button>
      </div>
    </section>
  );
}
