import { AdminSpaceTable } from "@/components/admin/admin-space-table";
import { listCatalogSpaces } from "@/lib/admin-catalog";

export const dynamic = "force-dynamic";

export default async function AdminSpacesPage() {
  const spaces = await listCatalogSpaces();
  return <AdminSpaceTable initialSpaces={spaces} />;
}
