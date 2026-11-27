"use client";

import Link from "next/link";
import { useState } from "react";
import {
  IconCalendar,
  IconClock,
  IconEdit,
  IconPerson,
  IconPlus,
} from "@/components/admin/admin-icons";
import {
  openWeekdays,
  WEEKDAY_KEYS,
  WEEKDAY_SHORT,
  type AdminSpace,
} from "@/domain/admin-space";
import { routes } from "@/lib/routes";

type AdminSpaceTableProps = {
  initialSpaces: AdminSpace[];
};

export function AdminSpaceTable({ initialSpaces }: AdminSpaceTableProps) {
  const [spaces, setSpaces] = useState(initialSpaces);

  function toggleActive(id: string) {
    setSpaces((current) =>
      current.map((space) =>
        space.id === id ? { ...space, active: !space.active } : space,
      ),
    );
  }

  return (
    <div>
      <div className="mb-3 flex justify-end gap-2">
        <button
          type="button"
          aria-label="정렬"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rsvd-border bg-rsvd-surface text-rsvd-text-muted"
        >
          ↕
        </button>
        <button
          type="button"
          aria-label="매장 추가"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rsvd-border bg-rsvd-surface text-rsvd-text"
        >
          <IconPlus />
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-rsvd-border bg-rsvd-surface">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-rsvd-border text-xs text-rsvd-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">공간명칭</th>
              <th className="px-4 py-3 font-medium">주소</th>
              <th className="px-4 py-3 font-medium">영업요일</th>
              <th className="px-4 py-3 font-medium">현재예약수</th>
              <th className="px-4 py-3 font-medium">단골수</th>
              <th className="px-4 py-3 font-medium">활성/비활성</th>
              <th className="px-4 py-3 font-medium">설정</th>
            </tr>
          </thead>
          <tbody>
            {spaces.map((space) => {
              const open = new Set(openWeekdays(space));
              return (
                <tr
                  key={space.id}
                  className="border-b border-rsvd-border last:border-b-0"
                >
                  <td className="px-4 py-3.5 font-medium text-rsvd-text">
                    {space.name}
                  </td>
                  <td className="max-w-[18rem] px-4 py-3.5 text-rsvd-text-muted">
                    <span className="line-clamp-2">{space.address}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1.5 font-medium tracking-wide">
                      {WEEKDAY_KEYS.map((day) => (
                        <span
                          key={day}
                          className={
                            open.has(day)
                              ? "text-rsvd-text"
                              : "text-rsvd-border"
                          }
                        >
                          {WEEKDAY_SHORT[day]}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-rsvd-text">
                    {space.currentReservationCount}
                  </td>
                  <td className="px-4 py-3.5 text-rsvd-text">
                    {space.regularUserIds?.length ?? 0}
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={space.active}
                      aria-label={`${space.name} 활성 여부`}
                      onClick={() => toggleActive(space.id)}
                      className={`relative h-6 w-11 rounded-full transition ${
                        space.active ? "bg-rsvd-brand" : "bg-rsvd-border"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-rsvd-surface transition ${
                          space.active ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-rsvd-text-muted">
                      <button
                        type="button"
                        aria-label={`${space.name} 수정`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-rsvd-bg hover:text-rsvd-text"
                      >
                        <IconEdit />
                      </button>
                      <Link
                        href={routes.adminSpaceHours(space.id)}
                        aria-label={`${space.name} 영업시간`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-rsvd-bg hover:text-rsvd-text"
                      >
                        <IconClock />
                      </Link>
                      <Link
                        href={routes.adminSpaceExceptions(space.id)}
                        aria-label={`${space.name} 예외영업일`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-rsvd-bg hover:text-rsvd-text"
                      >
                        <IconCalendar />
                      </Link>
                      <button
                        type="button"
                        aria-label={`${space.name} 관리자계정`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-rsvd-bg hover:text-rsvd-text"
                      >
                        <IconPerson />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
