import React from "react";
import { BookOpen } from "lucide-react";
import LearnPagePlaceholder from "@/components/learn/LearnPagePlaceholder";

export default function LlmGuide() {
  return (
    <LearnPagePlaceholder
      title="LLM Guide"
      description="Everything you need to know about working effectively with large language models."
      icon={BookOpen}
    />
  );
}