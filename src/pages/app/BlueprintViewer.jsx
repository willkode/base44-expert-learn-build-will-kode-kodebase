import React from "react";
import { useOutletContext } from "react-router-dom";
import { FileText, Sparkles } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";

export default function BlueprintViewer() {
  const { project } = useOutletContext();

  return (
    <EmptyState
      icon={FileText}
      title="No blueprint generated yet"
      description={`Generate a full Base44 build blueprint for "${project.projectName}" — entities, roles, permissions, pages, and backend plan.`}
      actionLabel="Generate Blueprint"
      onAction={() => {}}
    />
  );
}