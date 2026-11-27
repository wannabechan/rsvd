import { notFound } from "next/navigation";
import { AdminExceptionsList } from "@/components/admin/admin-exceptions-list";
import { getCatalogSpaceById } from "@/lib/admin-catalog";

export const dynamic = "force-dynamic";

type ExceptionsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminSpaceExceptionsPage({
  params,
}: ExceptionsPageProps) {
  const { id } = await params;
  const space = await getCatalogSpaceById(id);
  if (!space) {
    notFound();
  }
  return <AdminExceptionsList space={space} />;
}
