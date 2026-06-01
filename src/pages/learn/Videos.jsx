import React from "react";
import { Video } from "lucide-react";
import LearnPagePlaceholder from "@/components/learn/LearnPagePlaceholder";

export default function Videos() {
  return (
    <LearnPagePlaceholder
      title="Videos"
      description="Walkthroughs, demos, and step-by-step video guides for mastering Base44."
      icon={Video}
    />
  );
}