import { connection } from "next/server";
import { Suspense } from "react";
import { AdminSpaceTable } from "@/components/admin/admin-space-table";
import { listCatalogSpaces } from "@/lib/admin-catalog";
import { listSpaceCandidates } from "@/lib/admin-space-candidates";

export default function AdminSpacesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-rsvd-text-muted">불러오는 중…</p>}>
      <AdminSpacesContent />
    </Suspense>
  );
}

async function AdminSpacesContent() {
  await connection();
  // Backfill inactive catalog spaces for registration-complete candidates.
  await listSpaceCandidates();
  const spaces = await listCatalogSpaces();
  return <AdminSpaceTable initialSpaces={spaces} />;
}
