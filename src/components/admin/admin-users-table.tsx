"use client";

import {
  formatJoinedAt,
  type AdminUser,
} from "@/domain/admin-user";

type AdminUsersTableProps = {
  users: AdminUser[];
};

export function AdminUsersTable({ users }: AdminUsersTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-rsvd-border bg-rsvd-surface">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-rsvd-border text-xs text-rsvd-text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">이메일</th>
            <th className="px-4 py-3 font-medium">가입일</th>
            <th className="px-4 py-3 font-medium">닉네임</th>
            <th className="px-4 py-3 font-medium">연락처</th>
            <th className="px-4 py-3 font-medium">등급</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
