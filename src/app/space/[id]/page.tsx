import { notFound } from "next/navigation";
import { SpaceDetail } from "@/components/space/space-detail";
import { getSpaceById, SAMPLE_SPACES } from "@/data/spaces";

export function generateStaticParams() {
  return SAMPLE_SPACES.map((space) => ({ id: space.id }));
}

export default async function SpaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const space = getSpaceById(id);

  if (!space) {
    notFound();
  }

  return <SpaceDetail space={space} />;
}
