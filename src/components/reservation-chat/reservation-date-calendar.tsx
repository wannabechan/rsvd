"use client";

import { useMemo, useState } from "react";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

type ReservationDateCalendarProps = {
  selectedDate: string | null;
  onSelectDate: (dateKey: string) => void;
};

export function ReservationDateCalendar({
  selectedDate,
  onSelectDate,
}: ReservationDateCalendarProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [viewMonth, setViewMonth] = useState(() =>
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const days = useMemo(() => buildCalendarDays(viewMonth), [viewMonth]);
  const monthLabel = formatMonthLabel(viewMonth);
  const canGoPrev =
    viewMonth.getFullYear() > today.getFullYear() ||
    (viewMonth.getFullYear() === today.getFullYear() &&
      viewMonth.getMonth() > today.getMonth());

  return (
    <div
      className="w-full max-w-[20rem] rounded-2xl border border-rsvd-border bg-rsvd-surface p-3"
      aria-label="예약 희망일 선택"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="이전 달"
          disabled={!canGoPrev}
          onClick={() => {
            setViewMonth(
              (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
            );
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-rsvd-brand transition hover:bg-rsvd-tint disabled:text-rsvd-disabled-text disabled:hover:bg-transparent"
        >
          ‹
        </button>
        <p className="text-sm font-medium text-rsvd-text">{monthLabel}</p>
        <button
          type="button"
          aria-label="다음 달"
          onClick={() => {
            setViewMonth(
              (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
            );
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-rsvd-brand transition hover:bg-rsvd-tint"
        >
          ›
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className="py-1 text-center text-[0.7rem] font-medium text-rsvd-text-muted"
          >
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (!day) {
            return <span key={`empty-${index}`} className="h-9" />;
          }

          const dateKey = toDateKey(day);
          const isPast = day < today;
          const isSelected = selectedDate === dateKey;
          const isToday = toDateKey(today) === dateKey;

          return (
            <button
              key={dateKey}
              type="button"
              disabled={isPast}
              aria-label={`${formatFullDate(day)} 선택`}
              aria-pressed={isSelected}
              onClick={() => onSelectDate(dateKey)}
              className={`inline-flex h-9 items-center justify-center rounded-full text-sm transition ${
                isSelected
                  ? "border border-rsvd-brand bg-rsvd-tint font-medium text-rsvd-brand"
                  : isPast
                    ? "cursor-not-allowed text-rsvd-disabled-text"
                    : `border border-transparent text-rsvd-text hover:border-rsvd-border hover:bg-rsvd-surface ${
                        isToday ? "font-medium text-rsvd-brand" : ""
                      }`
              }`}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function buildCalendarDays(monthStart: Date) {
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const firstWeekday = monthStart.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
  }).format(date);
}

function formatFullDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
}
