import React from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/shared/EmptyState";

export default function RecentPromptPacks({ packs }) {
  const navigate = useNavigate();

  return (
    <div className="mb-10">
      <h2 className="font-sora font-semibold text-lg mb-4">Recent Prompt Packs</h2>
      {packs.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No prompt packs yet"
          description="Generate a blueprint to create Base44-ready build prompts you can copy straight into Base44."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packs.slice(0, 4).map((pack) => (
            <div key={pack.id} className="rounded-2xl border border-border bg-card/70 p-5 hover:border-primary/40 transition-colors">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Boxes className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <h3 className="font-sora font-semibold text-sm">{pack.title || "Prompt Pack"}</h3>
                  <p className="text-xs text-muted-foreground">{pack.totalPrompts || 0} prompts</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {format(new Date(pack.created_date), "MMM d, yyyy")}
                </span>
                <Button size="sm" variant="outline" onClick={() => navigate(`/projects/${pack.projectId}/prompts`)}>Open</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}