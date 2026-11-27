import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminExceptionForm } from "@/components/admin/admin-exception-form";
import { getCatalogSpaceById } from "@/lib/admin-catalog";

type EditExceptionPageProps = {
  params: Promise<{ id: string; exceptionId: string }>;
};

export default function AdminSpaceExceptionEditPage({
  params,
}: EditExceptionPageProps) {
  return (
    <Suspense fallback={<p className="text-sm text-rsvd-text-muted">불러오는 중…</p>}>
      <EditExceptionContent params={params} />
    </Suspense>
  );
}

async function EditExceptionContent({ params }: EditExceptionPageProps) {
  const { id, exceptionId } = await params;
  const space = await getCatalogSpaceById(id);
  if (!space) {
    notFound();
  }
  const exception = space.exceptions.find((item) => item.id === exceptionId);
  if (!exception) {
    notFound();
  }
  return <AdminExceptionForm space={space} exception={exception} />;
}
