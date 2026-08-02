import React from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Package, ArrowRight, FileText, CalendarDays } from "lucide-react";
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
    <ul className="space-y-3">
      {packs.map((pk) => (
        <li
          key={pk.id}
          className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-border bg-card/70 p-4 sm:p-5 transition-all hover:border-primary/40 hover:bg-card"
        >
          <span className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-primary/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 sm:flex">
              <Package className="w-4.5 h-4.5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h3 className="font-sora font-semibold truncate">{pk.title || "Prompt Pack"}</h3>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                  {pk.totalPrompts || 0} prompts
                </span>
                {pk.created_date && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
                    {format(new Date(pk.created_date), "MMM d, yyyy")}
                  </span>
                )}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/projects/${pk.projectId}/prompts`)}
            className="shrink-0 rounded-full transition-colors group-hover:border-primary/50 group-hover:text-primary"
          >
            Open <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </li>
      ))}
    </ul>
  );
}