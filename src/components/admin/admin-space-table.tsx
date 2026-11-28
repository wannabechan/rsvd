"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  IconCalendar,
  IconClock,
  IconEdit,
  IconPlus,
} from "@/components/admin/admin-icons";
import { ButtonSpinner } from "@/components/ui/button-spinner";
import {
  adminSpaceRegularCount,
  adminSpaceReservationCount,
  formatSpaceCreatedAt,
  openWeekdays,
  sortAdminSpaces,
  WEEKDAY_KEYS,
  WEEKDAY_SHORT,
  type AdminSpace,
  type AdminSpaceSortDir,
  type AdminSpaceSortKey,
} from "@/domain/admin-space";
import { routes } from "@/lib/routes";

type AdminSpaceTableProps = {
  initialSpaces: AdminSpace[];
};

type ActiveDialog =
  | { kind: "confirm"; space: AdminSpace; nextActive: boolean }
  | { kind: "blocked"; space: AdminSpace }
  | null;

const COLUMNS: { key: AdminSpaceSortKey; label: string }[] = [
  { key: "name", label: "공간명칭" },
  { key: "createdAt", label: "생성일" },
  { key: "address", label: "주소" },
  { key: "openDays", label: "영업요일" },
  { key: "reservationCount", label: "현재예약수" },
  { key: "regularCount", label: "단골수" },
  { key: "active", label: "활성/비활성" },
];

export function AdminSpaceTable({ initialSpaces }: AdminSpaceTableProps) {
  const [spaces, setSpaces] = useState(initialSpaces);
  const [dialog, setDialog] = useState<ActiveDialog>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<AdminSpaceSortKey>("createdAt");
  const [sortDir, setSortDir] = useState<AdminSpaceSortDir>("desc");

  useEffect(() => {
    setSpaces(initialSpaces);
  }, [initialSpaces]);

  const visibleSpaces = useMemo(
    () => sortAdminSpaces(spaces, sortKey, sortDir),
    [spaces, sortKey, sortDir],
  );

  function toggleSort(key: AdminSpaceSortKey) {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  }

  function requestToggle(space: AdminSpace) {
    setError(null);
    const nextActive = !space.active;
    if (
      space.active &&
      !nextActive &&
      adminSpaceReservationCount(space) > 0
    ) {
      setDialog({ kind: "blocked", space });
      return;
    }
    setDialog({ kind: "confirm", space, nextActive });
  }

  async function confirmToggle() {
    if (!dialog || dialog.kind !== "confirm") {
      return;
    }
    const { space, nextActive } = dialog;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/spaces/${space.id}/active`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ active: nextActive }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        reason?: string;
        error?: string;
        space?: AdminSpace;
      };
      if (response.status === 409 || data.reason === "has-reservations") {
        setDialog({ kind: "blocked", space });
        setSaving(false);
        return;
      }
      if (!response.ok || !data.ok || !data.space) {
        setError(data.error ?? "활성 상태 저장에 실패했습니다.");
        setDialog(null);
        setSaving(false);
        return;
      }
      setSpaces((current) =>
        current.map((item) => (item.id === data.space!.id ? data.space! : item)),
      );
      setDialog(null);
      setSaving(false);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-3 flex justify-end gap-2">
        <Link
          href={routes.adminSpaceNew}
          aria-label="매장 추가"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rsvd-border bg-rsvd-surface text-rsvd-text transition hover:bg-rsvd-bg"
        >
          <IconPlus />
        </Link>
      </div>

      {error ? (
        <p className="mb-3 text-sm text-rsvd-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-rsvd-border bg-rsvd-surface">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-rsvd-border text-xs text-rsvd-text-muted">
            <tr>
              {COLUMNS.map((column) => {
                const active = sortKey === column.key;
                return (
                  <th key={column.key} className="px-4 py-3 font-medium">
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className="inline-flex items-center gap-1 text-left transition hover:text-rsvd-text"
                      aria-label={`${column.label} ${
                        active
                          ? sortDir === "asc"
                            ? "오름차순"
                            : "내림차순"
                          : "정렬"
                      }`}
                    >
                      <span>{column.label}</span>
                      {active ? (
                        <span
                          aria-hidden="true"
                          className="text-[0.65rem] leading-none"
                        >
                          {sortDir === "asc" ? "▲" : "▼"}
                        </span>
                      ) : null}
                    </button>
                  </th>
                );
              })}
              <th className="px-4 py-3 font-medium">설정</th>
            </tr>
          </thead>
          <tbody>
            {visibleSpaces.map((space) => {
              const open = new Set(openWeekdays(space));
              return (
                <tr
                  key={space.id}
                  className="border-b border-rsvd-border last:border-b-0"
                >
                  <td className="px-4 py-3.5 font-medium text-rsvd-text">
                    {space.name || "—"}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-rsvd-text-muted">
                    {formatSpaceCreatedAt(space.createdAt)}
                  </td>
                  <td className="max-w-[9rem] px-4 py-3.5 text-rsvd-text-muted">
                    <span className="line-clamp-2">{space.address || "—"}</span>
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
                    {adminSpaceReservationCount(space)}
                  </td>
                  <td className="px-4 py-3.5 text-rsvd-text">
                    {adminSpaceRegularCount(space)}
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={space.active}
                      aria-label={`${space.name || "매장"} 활성 여부`}
                      disabled={saving}
                      onClick={() => requestToggle(space)}
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
                      <Link
                        href={routes.adminSpaceEdit(space.id)}
                        aria-label={`${space.name || "매장"} 매장 수정`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-rsvd-bg hover:text-rsvd-text"
                      >
                        <IconEdit />
                      </Link>
                      <Link
                        href={routes.adminSpaceHours(space.id)}
                        aria-label={`${space.name || "매장"} 영업 시간`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-rsvd-bg hover:text-rsvd-text"
                      >
                        <IconClock />
                      </Link>
                      <Link
                        href={routes.adminSpaceExceptions(space.id)}
                        aria-label={`${space.name || "매장"} 예외 날짜`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-rsvd-bg hover:text-rsvd-text"
                      >
                        <IconCalendar />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {dialog?.kind === "confirm" ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-rsvd-text/40 px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="space-active-confirm-title"
        >
          <div className="w-full max-w-sm rounded-3xl border border-rsvd-border bg-rsvd-surface p-5 shadow-sm">
            <p
              id="space-active-confirm-title"
              className="text-center text-sm font-medium text-rsvd-text"
            >
              {dialog.nextActive
                ? "활성화 하시겠습니까?"
                : "비활성화 하시겠습니까?"}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => setDialog(null)}
                className="inline-flex h-11 items-center justify-center rounded-full border border-rsvd-border bg-rsvd-surface text-sm font-medium text-rsvd-text transition hover:bg-rsvd-bg disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
              >
                취소
              </button>
              <button
                type="button"
                disabled={saving}
                aria-busy={saving}
                onClick={() => {
                  void confirmToggle();
                }}
                className={`inline-flex h-11 items-center justify-center rounded-full bg-rsvd-brand text-sm font-medium text-rsvd-on-brand transition hover:bg-rsvd-brand-strong ${
                  saving
                    ? "disabled:bg-rsvd-brand disabled:text-rsvd-on-brand disabled:hover:bg-rsvd-brand"
                    : "disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
                }`}
              >
                {saving ? <ButtonSpinner /> : "확인"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {dialog?.kind === "blocked" ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-rsvd-text/40 px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="space-active-blocked-title"
        >
          <div className="w-full max-w-sm rounded-3xl border border-rsvd-border bg-rsvd-surface p-5 shadow-sm">
            <p
              id="space-active-blocked-title"
              className="text-center text-sm font-medium text-rsvd-text"
            >
              잔여 예약이 남아있습니다.
            </p>
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => setDialog(null)}
                className="inline-flex h-11 min-w-[7rem] items-center justify-center rounded-full bg-rsvd-brand px-4 text-sm font-medium text-rsvd-on-brand transition hover:bg-rsvd-brand-strong"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
