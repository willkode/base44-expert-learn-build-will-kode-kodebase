import React from "react";
import { useOutletContext } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";

export default function SecurityReview() {
  const { project } = useOutletContext();

  return (
    <EmptyState
      icon={ShieldCheck}
      title="No security review yet"
      description={`Run a security review on "${project.name}" to surface permission gaps, ownership issues, and exposed data risks.`}
      actionLabel="Run Security Review"
      onAction={() => {}}
    />
  );
}