import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { SpaceDetail } from "@/components/space/space-detail";
import { getPublicSpaceById } from "@/lib/admin-catalog";

export default function SpaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-10">
          <p className="text-sm text-rsvd-text-muted">불러오는 중…</p>
        </div>
      }
    >
      <SpaceDetailContent params={params} />
    </Suspense>
  );
}

async function SpaceDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  const space = await getPublicSpaceById(id);

  if (!space) {
    notFound();
  }

  return <SpaceDetail space={space} />;
}
