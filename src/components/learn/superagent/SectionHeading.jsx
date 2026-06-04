import React from "react";

export default function SectionHeading({ label, title }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-12">
      {label && (
        <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">{label}</p>
      )}
      <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight">{title}</h2>
    </div>
  );
}