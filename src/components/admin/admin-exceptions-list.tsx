"use client";

import Link from "next/link";
import { useState } from "react";
import {
  IconEdit,
  IconPlus,
  IconTrash,
} from "@/components/admin/admin-icons";
import {
  formatAdminDateLabel,
  formatExceptionKind,
  type AdminSpace,
  type ExceptionDateRange,
} from "@/domain/admin-space";
import { routes } from "@/lib/routes";

type AdminExceptionsListProps = {
  space: AdminSpace;
};

export function AdminExceptionsList({ space }: AdminExceptionsListProps) {
  const [exceptions, setExceptions] = useState<ExceptionDateRange[]>(
    space.exceptions,
  );
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  function confirmDelete() {
    if (!pendingDeleteId) {
      return;
    }
    setExceptions((current) =>
      current.filter((item) => item.id !== pendingDeleteId),
    );
    setPendingDeleteId(null);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-lg font-medium text-rsvd-text">
          예외 날짜{" "}
          <span className="font-normal text-rsvd-text-muted">/ {space.name}</span>
        </h1>
        <Link
          href={routes.adminSpaces}
          className="text-sm text-rsvd-text-muted transition hover:text-rsvd-brand"
        >
          ← 공간 목록
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-rsvd-border bg-rsvd-surface">
        <table className="min-w-full text-center text-sm">
          <thead className="border-b border-rsvd-border text-xs text-rsvd-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">시작일</th>
              <th className="px-4 py-3 font-medium">종료일</th>
              <th className="px-4 py-3 font-medium">휴무 또는 영업</th>
              <th className="px-4 py-3 font-medium">설정</th>
            </tr>
          </thead>
          <tbody>
            {exceptions.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-sm text-rsvd-text-muted"
                >
                  등록된 예외 날짜가 없습니다.
                </td>
              </tr>
            ) : (
              exceptions.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-rsvd-border last:border-b-0"
                >
                  <td className="px-4 py-3.5 text-rsvd-text">
                    {formatAdminDateLabel(item.startDate)}
                  </td>
                  <td className="px-4 py-3.5 text-rsvd-text">
                    {formatAdminDateLabel(item.endDate)}
                  </td>
                  <td
                    className={`px-4 py-3.5 font-medium ${
                      item.kind === "closed"
                        ? "text-rsvd-danger"
                        : "text-rsvd-success"
                    }`}
                  >
                    {formatExceptionKind(item.kind)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1.5 text-rsvd-text-muted">
                      <Link
                        href={routes.adminSpaceExceptionEdit(space.id, item.id)}
                        aria-label="예외 날짜 수정"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-rsvd-bg hover:text-rsvd-text"
                      >
                        <IconEdit />
                      </Link>
                      <button
                        type="button"
                        aria-label="예외 날짜 삭제"
                        onClick={() => setPendingDeleteId(item.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-rsvd-bg hover:text-rsvd-danger"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <Link
          href={routes.adminSpaceExceptionNew(space.id)}
          aria-label="예외 날짜 추가"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rsvd-border bg-rsvd-surface text-rsvd-text shadow-sm transition hover:bg-rsvd-tint"
        >
          <IconPlus />
        </Link>
      </div>

      {pendingDeleteId ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-rsvd-text/40 px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exception-delete-title"
        >
          <div className="w-full max-w-sm rounded-3xl border border-rsvd-border bg-rsvd-surface p-5 shadow-sm">
            <p
              id="exception-delete-title"
              className="text-center text-sm font-medium text-rsvd-text"
            >
              삭제하시겠습니까?
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPendingDeleteId(null)}
                className="inline-flex h-11 items-center justify-center rounded-full border border-rsvd-border bg-rsvd-surface text-sm font-medium text-rsvd-text transition hover:bg-rsvd-bg"
              >
                취소
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="inline-flex h-11 items-center justify-center rounded-full bg-rsvd-brand text-sm font-medium text-rsvd-on-brand transition hover:bg-rsvd-brand-strong"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
