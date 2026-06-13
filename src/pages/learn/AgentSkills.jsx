import React from "react";
import { Sparkles } from "lucide-react";
import LearnPagePlaceholder from "@/components/learn/LearnPagePlaceholder";

export default function AgentSkills() {
  return (
    <LearnPagePlaceholder
      title="Agent Skills"
      description="Reusable skills and capabilities to make your AI agents smarter and more reliable."
      icon={Sparkles}
      path="/learn/agent-skills"
    />
  );
}