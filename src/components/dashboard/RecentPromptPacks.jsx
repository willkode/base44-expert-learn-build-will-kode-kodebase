import React from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Package, ArrowRight } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";

export default function RecentPromptPacks({ packs }) {
  const navigate = useNavigate();

  if (packs.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No prompt packs yet"
        description="Generate a blueprint for a project and your Base44-ready build prompts will appear here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {packs.map((pk) => (
        <div key={pk.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card/70 p-4 hover:border-primary/40 transition-colors">
          <div className="min-w-0">
            <h3 className="font-sora font-semibold truncate">{pk.title || "Prompt Pack"}</h3>
            <p className="text-xs text-muted-foreground">
              {pk.totalPrompts || 0} prompts · {pk.created_date ? format(new Date(pk.created_date), "MMM d, yyyy") : ""}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${pk.projectId}/prompts`)} className="shrink-0">
            Open <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      ))}
    </div>
  );
}