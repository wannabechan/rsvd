import { connection } from "next/server";
import { Suspense } from "react";
import { AdminSpaceCandidatesTable } from "@/components/admin/admin-space-candidates-table";
import { listCatalogUsers } from "@/lib/admin-catalog";
import { listSpaceCandidates } from "@/lib/admin-space-candidates";

export default function AdminSpaceCandidatesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-rsvd-text-muted">불러오는 중…</p>}>
      <AdminSpaceCandidatesContent />
    </Suspense>
  );
}

async function AdminSpaceCandidatesContent() {
  await connection();
  const [candidates, users] = await Promise.all([
    listSpaceCandidates(),
    listCatalogUsers(),
  ]);
  return (
    <AdminSpaceCandidatesTable
      initialCandidates={candidates}
      users={users}
    />
  );
}
