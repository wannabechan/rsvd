import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminExceptionForm } from "@/components/admin/admin-exception-form";
import { getCatalogSpaceById } from "@/lib/admin-catalog";

type NewExceptionPageProps = {
  params: Promise<{ id: string }>;
};

export default function AdminSpaceExceptionNewPage({
  params,
}: NewExceptionPageProps) {
  return (
    <Suspense fallback={<p className="text-sm text-rsvd-text-muted">불러오는 중…</p>}>
      <NewExceptionContent params={params} />
    </Suspense>
  );
}

async function NewExceptionContent({ params }: NewExceptionPageProps) {
  const { id } = await params;
  const space = await getCatalogSpaceById(id);
  if (!space) {
    notFound();
  }
  return <AdminExceptionForm space={space} />;
}
