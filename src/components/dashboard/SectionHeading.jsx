import React from "react";

export default function SectionHeading({ icon: Icon, children }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      {Icon && (
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
          <Icon className="w-4 h-4" aria-hidden="true" />
        </span>
      )}
      <h2 className="font-sora font-semibold text-lg tracking-tight">{children}</h2>
      <span className="ml-1 hidden h-px flex-1 bg-gradient-to-r from-border to-transparent sm:block" />
    </div>
  );
}