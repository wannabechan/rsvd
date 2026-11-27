import { notFound } from "next/navigation";
import { AdminExceptionForm } from "@/components/admin/admin-exception-form";
import { getCatalogSpaceById } from "@/lib/admin-catalog";

export const dynamic = "force-dynamic";

type EditExceptionPageProps = {
  params: Promise<{ id: string; exceptionId: string }>;
};

export default async function AdminSpaceExceptionEditPage({
  params,
}: EditExceptionPageProps) {
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
