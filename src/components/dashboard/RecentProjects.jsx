import React from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { FolderKanban, ArrowRight } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";

const STATUS_STYLES = {
  draft: "bg-secondary text-muted-foreground",
  generating: "bg-chart-2/15 text-chart-2",
  completed: "bg-green-500/15 text-green-400",
  archived: "bg-secondary text-muted-foreground",
};

export default function RecentProjects({ projects }) {
  const navigate = useNavigate();

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="No projects yet"
        description="Describe an app idea and let the AI architect generate a full Base44 build blueprint."
        actionLabel="Create your first project"
        onAction={() => navigate("/projects/new")}
      />
    );
  }

  return (
    <div className="space-y-3">
      {projects.map((p) => (
        <div key={p.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card/70 p-4 hover:border-primary/40 transition-colors">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              <h3 className="font-sora font-semibold truncate">{p.projectName}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[p.status] || STATUS_STYLES.draft}`}>{p.status}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {p.updated_date ? `Updated ${format(new Date(p.updated_date), "MMM d, yyyy")}` : "Just created"}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${p.id}`)} className="shrink-0">
            Open <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      ))}
    </div>
  );
}