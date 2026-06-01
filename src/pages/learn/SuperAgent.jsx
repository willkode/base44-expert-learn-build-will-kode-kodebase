import React from "react";
import { Bot } from "lucide-react";
import LearnPagePlaceholder from "@/components/learn/LearnPagePlaceholder";

export default function SuperAgent() {
  return (
    <LearnPagePlaceholder
      title="SuperAgent"
      description="Our most powerful agent setup for planning, building, and shipping complete apps."
      icon={Bot}
    />
  );
}