"use client";

import { useMemo, useState } from "react";
import {
  filterAdminUsers,
  formatJoinedAt,
  type AdminUser,
} from "@/domain/admin-user";

type AdminUserMatchModalProps = {
  users: AdminUser[];
  onCancel: () => void;
  onMatch: (user: AdminUser) => void;
};

export function AdminUserMatchModal({
  users,
  onCancel,
  onMatch,
}: AdminUserMatchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visibleUsers = useMemo(
    () => filterAdminUsers(users, query),
    [users, query],
  );
  const selected = visibleUsers.find((user) => user.id === selectedId) ?? null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-rsvd-text/40 px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-user-match-title"
    >
      <div className="flex max-h-[min(36rem,90dvh)] w-full max-w-lg flex-col rounded-3xl border border-rsvd-border bg-rsvd-surface p-5 shadow-sm">
        <h2
          id="admin-user-match-title"
          className="text-base font-medium text-rsvd-text"
        >
          사용자 검색
        </h2>

        <label className="mt-4 block">
          <span className="sr-only">사용자 검색</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="이메일, 닉네임, 연락처, 등급 검색"
            className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text placeholder:text-rsvd-text-muted"
            autoFocus
          />
        </label>

        <div className="mt-3 min-h-0 flex-1 overflow-y-auto rounded-2xl border border-rsvd-border">
          {visibleUsers.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-rsvd-text-muted">
              검색 결과가 없습니다.
            </p>
          ) : (
            <ul className="divide-y divide-rsvd-border">
              {visibleUsers.map((user) => {
                const active = user.id === selectedId;
                return (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(user.id)}
                      className={`flex w-full flex-col gap-0.5 px-4 py-3 text-left transition ${
                        active ? "bg-rsvd-tint" : "hover:bg-rsvd-bg"
                      }`}
                    >
                      <span className="text-sm font-medium text-rsvd-text">
                        {user.email}
                      </span>
                      <span className="text-xs text-rsvd-text-muted">
                        {user.nickname || "—"} · {formatJoinedAt(user.joinedAt)} ·{" "}
                        {user.grade}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-11 items-center justify-center rounded-full border border-rsvd-border bg-rsvd-surface text-sm font-medium text-rsvd-text transition hover:bg-rsvd-bg"
          >
            취소
          </button>
          <button
            type="button"
            disabled={!selected}
            onClick={() => {
              if (selected) {
                onMatch(selected);
              }
            }}
            className="inline-flex h-11 items-center justify-center rounded-full bg-rsvd-brand text-sm font-medium text-rsvd-on-brand transition hover:bg-rsvd-brand-strong disabled:bg-rsvd-disabled-bg disabled:text-rsvd-disabled-text"
          >
            매칭
          </button>
        </div>
      </div>
    </div>
  );
}
