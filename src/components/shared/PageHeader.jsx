import React from "react";

export default function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="font-sora font-bold text-2xl md:text-3xl tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-1.5 text-sm md:text-base">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}