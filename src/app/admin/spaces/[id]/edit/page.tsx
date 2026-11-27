import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminSpaceEditForm } from "@/components/admin/admin-space-edit-form";
import { getCatalogSpaceById } from "@/lib/admin-catalog";

type EditPageProps = {
  params: Promise<{ id: string }>;
};

export default function AdminSpaceEditPage({ params }: EditPageProps) {
  return (
    <Suspense fallback={<p className="text-sm text-rsvd-text-muted">불러오는 중…</p>}>
      <EditContent params={params} />
    </Suspense>
  );
}

async function EditContent({ params }: EditPageProps) {
  const { id } = await params;
  const space = await getCatalogSpaceById(id);
  if (!space) {
    notFound();
  }
  return <AdminSpaceEditForm mode="edit" space={space} />;
}
