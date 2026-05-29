import React from "react";
import { useOutletContext } from "react-router-dom";
import { ClipboardCheck } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";

export default function QAChecklist() {
  const { project } = useOutletContext();

  return (
    <EmptyState
      icon={ClipboardCheck}
      title="No QA checklist yet"
      description={`Generate a launch QA checklist for "${project.projectName}" covering test cases, bug-risk areas, and regression checks.`}
      actionLabel="Generate QA Checklist"
      onAction={() => {}}
    />
  );
}