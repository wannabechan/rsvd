import { notFound } from "next/navigation";
import { AdminHoursEditor } from "@/components/admin/admin-hours-editor";
import { getCatalogSpaceById } from "@/lib/admin-catalog";

export const dynamic = "force-dynamic";

type HoursPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminSpaceHoursPage({ params }: HoursPageProps) {
  const { id } = await params;
  const space = await getCatalogSpaceById(id);
  if (!space) {
    notFound();
  }
  return <AdminHoursEditor space={space} />;
}
