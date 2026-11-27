import { SpaceList } from "@/components/space/space-list";
import { listPublicSpaces } from "@/lib/admin-catalog";

export const dynamic = "force-dynamic";

export default async function SpacePage() {
  const spaces = await listPublicSpaces();
  return <SpaceList spaces={spaces} />;
}
