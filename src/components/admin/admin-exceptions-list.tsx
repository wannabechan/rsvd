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

  function removeException(id: string) {
    setExceptions((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-lg font-medium text-rsvd-text">
          날짜설정{" "}
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
                        onClick={() => removeException(item.id)}
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
    </div>
  );
}
