import { notFound } from "next/navigation";
import { SpaceDetail } from "@/components/space/space-detail";
import { getPublicSpaceById } from "@/lib/admin-catalog";

export const dynamic = "force-dynamic";

export default async function SpaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const space = await getPublicSpaceById(id);

  if (!space) {
    notFound();
  }

  return <SpaceDetail space={space} />;
}
