import React from "react";
import { Library } from "lucide-react";
import LearnPagePlaceholder from "@/components/learn/LearnPagePlaceholder";

export default function PromptLibrary() {
  return (
    <LearnPagePlaceholder
      title="Prompt Library"
      description="A curated collection of battle-tested Base44 prompts you can copy and paste into your builds."
      icon={Library}
    />
  );
}