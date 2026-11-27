import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminExceptionsList } from "@/components/admin/admin-exceptions-list";
import { getCatalogSpaceById } from "@/lib/admin-catalog";

type ExceptionsPageProps = {
  params: Promise<{ id: string }>;
};

export default function AdminSpaceExceptionsPage({ params }: ExceptionsPageProps) {
  return (
    <Suspense fallback={<p className="text-sm text-rsvd-text-muted">불러오는 중…</p>}>
      <ExceptionsContent params={params} />
    </Suspense>
  );
}

async function ExceptionsContent({ params }: ExceptionsPageProps) {
  const { id } = await params;
  const space = await getCatalogSpaceById(id);
  if (!space) {
    notFound();
  }
  return <AdminExceptionsList space={space} />;
}
