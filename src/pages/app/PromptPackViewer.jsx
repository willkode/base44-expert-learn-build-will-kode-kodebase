import React from "react";
import { useOutletContext } from "react-router-dom";
import { Wand2 } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";

export default function PromptPackViewer() {
  const { project } = useOutletContext();

  return (
    <EmptyState
      icon={Wand2}
      title="No prompt pack yet"
      description={`Generate Base44-ready build prompts for "${project.projectName}", sequenced and ready to paste.`}
      actionLabel="Generate Prompt Pack"
      onAction={() => {}}
    />
  );
}