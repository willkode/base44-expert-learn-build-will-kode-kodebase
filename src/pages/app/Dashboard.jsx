import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { FolderKanban, FileText, ShieldCheck, FolderPlus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Project.list("-created_date", 50).then((p) => {
      setProjects(p);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <PageHeader
        title={`Welcome${user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}`}
        description="Your AI software architecture workspace."
        actions={
          <Button onClick={() => navigate("/projects/new")} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            <FolderPlus className="w-4 h-4 mr-2" /> New Project
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        <StatCard icon={FolderKanban} label="Projects" value={loading ? "—" : projects.length} />
        <StatCard icon={FileText} label="Blueprints" value={loading ? "—" : projects.filter((p) => p.status === "ready").length} />
        <StatCard icon={ShieldCheck} label="Plan" value={(user?.plan || "free").replace(/^\w/, (c) => c.toUpperCase())} />
      </div>

      <h2 className="font-sora font-semibold text-lg mb-4">Recent Projects</h2>
      {loading ? (
        <LoadingState label="Loading projects..." />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Start by describing an app idea and let the AI architect generate a full Base44 build blueprint."
          actionLabel="Create your first project"
          onAction={() => navigate("/projects/new")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.slice(0, 6).map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/projects/${p.id}`)}
              className="text-left rounded-2xl border border-border bg-card/70 p-5 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-sora font-semibold">{p.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">{p.status}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{p.idea || "No description yet."}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}