import { Lock } from "lucide-react";
import PlannerSection from "./PlannerSection";
import ChipGrid from "./ChipGrid";
import { previewItems } from "./plannerData";

export default function PlannerFreePreview() {
  return (
    <PlannerSection eyebrow="Free preview" title="What Your Free Preview Includes" intro="Your free assessment preview shows:">
      <ChipGrid items={previewItems} />
      <p className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Lock className="w-4 h-4 text-primary" /> Your full technical roadmap remains locked until you purchase the report.
      </p>
    </PlannerSection>
  );
}