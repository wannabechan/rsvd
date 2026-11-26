import { SpaceCard } from "@/components/space/space-card";
import { SAMPLE_SPACES } from "@/data/spaces";

export default function SpacePage() {
  return (
    <div className="px-4 pb-10 pt-4">
      <div className="grid grid-cols-2 gap-x-3 gap-y-6">
        {SAMPLE_SPACES.map((space) => (
          <SpaceCard key={space.id} space={space} />
        ))}
      </div>
    </div>
  );
}
