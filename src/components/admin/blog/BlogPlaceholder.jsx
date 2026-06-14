import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";

// Lightweight placeholder for blog admin sections that are wired but not yet
// fully implemented. Keeps the shell consistent with the app design system.
export default function BlogPlaceholder({ title, description, icon, emptyTitle, emptyDescription }) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={icon}
        title={emptyTitle}
        description={emptyDescription}
      />
    </div>
  );
}