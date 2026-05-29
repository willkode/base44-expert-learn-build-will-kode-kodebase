import React from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { FolderKanban, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/shared/EmptyState";

const statusStyles = {
  draft: "bg-secondary text-muted-foreground",
  generating: "bg-chart-2/15 text-chart-2",
  completed: "bg-green-500/15 text-green-400",
  archived: "bg-secondary text-muted-foreground",
};

export default function RecentProjects({ projects }) {
  const navigate = useNavigate();

  if (projects.length === 0) {
    return (
      <div className="mb-10">
        <h2 className="font-sora font-semibold text-lg mb-4">Recent Projects</h2>
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Start by describing an app idea and let the AI architect generate a full Base44 build blueprint."
          actionLabel="Create your first project"
          onAction={() => navigate("/projects/new")}
        />
      </div>
    );
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-sora font-semibold text-lg">Recent Projects</h2>
        <Button variant="ghost" size="sm" onClick={() => navigate("/projects")} className="text-muted-foreground hover:text-foreground">
          View all <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.slice(0, 6).map((p) => (
          <div key={p.id} className="rounded-2xl border border-border bg-card/70 p-5 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-sora font-semibold">{p.projectName}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusStyles[p.status] || statusStyles.draft}`}>{p.status}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{p.shortDescription || "No description yet."}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Updated {format(new Date(p.updated_date || p.created_date), "MMM d, yyyy")}
              </span>
              <Button size="sm" variant="outline" onClick={() => navigate(`/projects/${p.id}`)}>Open</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}