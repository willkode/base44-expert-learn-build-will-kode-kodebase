import React from "react";
import { Badge } from "@/components/ui/badge";

export default function MarketingToolCard({ icon: Icon, title, description, status, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors group"
    >
      <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#f87171]/15 via-[#fb923c]/15 to-[#facc15]/15 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex items-center gap-2 mb-1.5">
        <h3 className="font-sora font-semibold">{title}</h3>
        {status && <Badge variant="secondary" className="text-xs">{status}</Badge>}
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </button>
  );
}