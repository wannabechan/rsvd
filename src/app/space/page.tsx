import { SpaceList } from "@/components/space/space-list";
import { SAMPLE_SPACES } from "@/data/spaces";

export default function SpacePage() {
  return <SpaceList spaces={SAMPLE_SPACES} />;
}
