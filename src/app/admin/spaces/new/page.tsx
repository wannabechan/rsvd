import { AdminSpaceEditForm } from "@/components/admin/admin-space-edit-form";
import { createBlankAdminSpace } from "@/domain/admin-space";

export default function AdminSpaceNewPage() {
  return <AdminSpaceEditForm mode="create" space={createBlankAdminSpace()} />;
}
