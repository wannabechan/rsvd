import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminHoursEditor } from "@/components/admin/admin-hours-editor";
import { getCatalogSpaceById } from "@/lib/admin-catalog";

type HoursPageProps = {
  params: Promise<{ id: string }>;
};

export default function AdminSpaceHoursPage({ params }: HoursPageProps) {
  return (
    <Suspense fallback={<p className="text-sm text-rsvd-text-muted">불러오는 중…</p>}>
      <HoursContent params={params} />
    </Suspense>
  );
}

async function HoursContent({ params }: HoursPageProps) {
  const { id } = await params;
  const space = await getCatalogSpaceById(id);
  if (!space) {
    notFound();
  }
  return <AdminHoursEditor space={space} />;
}
