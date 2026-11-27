"use client";

import { useState } from "react";
import {
  filterAdminUsers,
  formatJoinedAt,
  sortAdminUsers,
  type AdminUser,
  type AdminUserSortDir,
  type AdminUserSortKey,
} from "@/domain/admin-user";

type AdminUsersTableProps = {
  users: AdminUser[];
};

const COLUMNS: { key: AdminUserSortKey; label: string }[] = [
  { key: "email", label: "이메일" },
  { key: "joinedAt", label: "가입일" },
  { key: "nickname", label: "닉네임" },
  { key: "phone", label: "연락처" },
  { key: "grade", label: "등급" },
];

export function AdminUsersTable({ users }: AdminUsersTableProps) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<AdminUserSortKey>("joinedAt");
  const [sortDir, setSortDir] = useState<AdminUserSortDir>("desc");

  const visibleUsers = sortAdminUsers(
    filterAdminUsers(users, query),
    sortKey,
    sortDir,
  );

  function toggleSort(key: AdminUserSortKey) {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="sr-only">사용자 검색</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="이메일, 닉네임, 연락처, 등급 검색"
          className="auth-input w-full rounded-xl border border-rsvd-border bg-rsvd-surface px-3.5 py-2.5 text-sm text-rsvd-text placeholder:text-rsvd-text-muted"
        />
      </label>

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
                        <span aria-hidden="true" className="text-[0.65rem] leading-none">
                          {sortDir === "asc" ? "▲" : "▼"}
                        </span>
                      ) : null}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visibleUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-4 py-10 text-center text-sm text-rsvd-text-muted"
                >
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              visibleUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-rsvd-border last:border-b-0"
                >
                  <td className="px-4 py-3.5 text-rsvd-text">{user.email}</td>
                  <td className="px-4 py-3.5 text-rsvd-text-muted">
                    {formatJoinedAt(user.joinedAt)}
                  </td>
                  <td className="px-4 py-3.5 text-rsvd-text">{user.nickname}</td>
                  <td className="px-4 py-3.5 text-rsvd-text-muted">{user.phone}</td>
                  <td className="px-4 py-3.5 font-medium text-rsvd-brand">
                    {user.grade}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
