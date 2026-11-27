import { connection } from "next/server";
import { Suspense } from "react";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { listCatalogUsers } from "@/lib/admin-catalog";

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<p className="text-sm text-rsvd-text-muted">불러오는 중…</p>}>
      <AdminUsersContent />
    </Suspense>
  );
}

async function AdminUsersContent() {
  await connection();
  const users = await listCatalogUsers();
  return <AdminUsersTable users={users} />;
}
