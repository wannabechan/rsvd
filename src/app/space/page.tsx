import { connection } from "next/server";
import { Suspense } from "react";
import { SpaceList } from "@/components/space/space-list";
import { listPublicSpaces } from "@/lib/admin-catalog";

export default function SpacePage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-10">
          <p className="text-sm text-rsvd-text-muted">불러오는 중…</p>
        </div>
      }
    >
      <SpacePageContent />
    </Suspense>
  );
}

async function SpacePageContent() {
  await connection();
  const spaces = await listPublicSpaces();
  return <SpaceList spaces={spaces} />;
}
