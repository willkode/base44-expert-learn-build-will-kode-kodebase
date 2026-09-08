import React from "react";
import { Check } from "lucide-react";

export default function KodeMailFeatureCard({ feature }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 overflow-hidden">
      <img
        src={feature.image}
        alt={feature.label}
        loading="lazy"
        className="w-full h-40 object-cover border-b border-border"
      />
      <div className="flex items-start gap-3 p-4">
        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <span className="text-sm">{feature.label}</span>
      </div>
    </div>
  );
}