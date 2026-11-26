import { notFound } from "next/navigation";
import { SpaceDetail } from "@/components/space/space-detail";
import { getSpaceById, SAMPLE_SPACES } from "@/data/spaces";

export function generateStaticParams() {
  return SAMPLE_SPACES.map((space) => ({ id: space.id }));
}

export default async function SpaceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ chat?: string }>;
}) {
  const { id } = await params;
  const { chat } = await searchParams;
  const space = getSpaceById(id);

  if (!space) {
    notFound();
  }

  return <SpaceDetail space={space} openChat={chat === "1"} />;
}
