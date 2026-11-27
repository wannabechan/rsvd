"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminSpace, ExceptionDateRange, ExceptionKind } from "@/domain/admin-space";
import { routes } from "@/lib/routes";

type AdminExceptionFormProps = {
  space: AdminSpace;
  exception?: ExceptionDateRange;
};

export function AdminExceptionForm({
  space,
  exception,
}: AdminExceptionFormProps) {
  const router = useRouter();
  const isEdit = Boolean(exception);
  const [startDate, setStartDate] = useState(exception?.startDate ?? "");
  const [endDate, setEndDate] = useState(exception?.endDate ?? "");
  const [kind, setKind] = useState<ExceptionKind>(exception?.kind ?? "closed");

  function handleSave() {
    // Sample UI only — persistence wired later.
    router.push(routes.adminSpaceExceptions(space.id));
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-lg font-medium text-rsvd-text">
          {isEdit ? "예외 날짜 수정" : "예외 날짜 추가"}{" "}
          <span className="font-normal text-rsvd-text-muted">/ {space.name}</span>
        </h1>
        <Link
          href={routes.adminSpaceExceptions(space.id)}
          className="text-sm text-rsvd-text-muted transition hover:text-rsvd-brand"
        >
          ← 예외 날짜
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-rsvd-text">시작일</span>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="mt-2 w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3 py-2.5 text-sm text-rsvd-text"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-rsvd-text">종료일</span>
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="mt-2 w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3 py-2.5 text-sm text-rsvd-text"
          />
        </label>
      </div>

      <fieldset className="mt-6">
        <legend className="text-sm font-medium text-rsvd-text">예외 유형</legend>
        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-2 text-sm text-rsvd-text">
            <input
              type="radio"
              name="exception-kind"
              checked={kind === "closed"}
              onChange={() => setKind("closed")}
              className="accent-[var(--rsvd-brand)]"
            />
            예외휴무
          </label>
          <label className="flex items-center gap-2 text-sm text-rsvd-text">
            <input
              type="radio"
              name="exception-kind"
              checked={kind === "open"}
              onChange={() => setKind("open")}
              className="accent-[var(--rsvd-brand)]"
            />
            예외영업
          </label>
        </div>
      </fieldset>

      <div className="mt-8 flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex h-11 items-center justify-center rounded-full bg-rsvd-brand px-5 text-sm font-medium text-rsvd-on-brand transition hover:bg-rsvd-brand-strong"
        >
          저장
        </button>
        <Link
          href={routes.adminSpaceExceptions(space.id)}
          className="inline-flex h-11 items-center justify-center rounded-full border border-rsvd-border bg-rsvd-surface px-5 text-sm font-medium text-rsvd-text transition hover:bg-rsvd-bg"
        >
          취소
        </Link>
      </div>
    </div>
  );
}
