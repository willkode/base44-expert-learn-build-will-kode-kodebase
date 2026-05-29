import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, FolderPlus, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import StatusBadge from "@/components/project/StatusBadge";
import { Button } from "@/components/ui/button";

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Project.list("-created_date", 100).then((p) => {
      setProjects(p);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <PageHeader
        title="Projects"
        description="All your architecture projects in one place."
        actions={
          <Button onClick={() => navigate("/projects/new")} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            <FolderPlus className="w-4 h-4 mr-2" /> New Project
          </Button>
        }
      />

      {loading ? (
        <LoadingState />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to generate a Base44 build blueprint."
          actionLabel="New Project"
          onAction={() => navigate("/projects/new")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/projects/${p.id}`)}
              className="group text-left rounded-2xl border border-border bg-card/70 p-5 hover:border-primary/40 hover:bg-card transition-all flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <h3 className="font-sora font-semibold truncate">{p.projectName}</h3>
                <span className="shrink-0"><StatusBadge status={p.status} /></span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{p.shortDescription || "No description yet."}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground capitalize">{p.appType || p.platformFocus || "Base44"}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}