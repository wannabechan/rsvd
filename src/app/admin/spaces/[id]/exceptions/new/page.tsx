import { notFound } from "next/navigation";
import { AdminExceptionForm } from "@/components/admin/admin-exception-form";
import { getCatalogSpaceById } from "@/lib/admin-catalog";

export const dynamic = "force-dynamic";

type NewExceptionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminSpaceExceptionNewPage({
  params,
}: NewExceptionPageProps) {
  const { id } = await params;
  const space = await getCatalogSpaceById(id);
  if (!space) {
    notFound();
  }
  return <AdminExceptionForm space={space} />;
}
