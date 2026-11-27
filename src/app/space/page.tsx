import { FloatingAddButton } from "@/components/layout/floating-add-button";
import { SpaceCard } from "@/components/space/space-card";
import { SAMPLE_SPACES } from "@/data/spaces";
import { sortSpacesByLikeCountDesc } from "@/domain/space";

export default function SpacePage() {
  const spaces = sortSpacesByLikeCountDesc(SAMPLE_SPACES);

  return (
    <>
      <div className="px-4 pb-24 pt-4">
        <div className="grid grid-cols-2 gap-x-3 gap-y-[26px]">
          {spaces.map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
        </div>
      </div>
      <FloatingAddButton />
    </>
  );
}
