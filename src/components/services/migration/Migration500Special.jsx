import React from "react";
import { Zap } from "lucide-react";

const OFFER_END = new Date("2026-07-26T00:00:00-05:00"); // valid through 07/25/2026

export function isMigrationSpecialActive() {
  return new Date() < OFFER_END;
}

export default function Migration500Special() {
  if (!isMigrationSpecialActive()) return null;
  return (
    <div className="inline-flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/15 via-card to-card px-6 py-4 glow-orange">
      <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
        <Zap className="w-4 h-4" /> Limited-Time Special
      </span>
      <p className="text-sm font-semibold text-foreground">
        $500 Migration Special — <span className="text-muted-foreground line-through">$2,000</span>{" "}
        <span className="text-gradient-orange font-extrabold text-base">$500</span>
        <span className="block sm:inline sm:ml-2 text-xs font-medium text-muted-foreground">Offer ends 07/25/2026</span>
      </p>
    </div>
  );
}