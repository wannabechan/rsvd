import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { listCatalogUsers } from "@/lib/admin-catalog";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await listCatalogUsers();
  return <AdminUsersTable users={users} />;
}
