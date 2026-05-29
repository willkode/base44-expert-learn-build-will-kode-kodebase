import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Outlet, NavLink, useOutletContext } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import { projectNav } from "@/components/layout/navConfig";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    base44.entities.Project.filter({ id })
      .then((res) => {
        if (res.length === 0) setError(true);
        else setProject(res[0]);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  if (loading) return <LoadingState label="Loading project..." />;
  if (error || !project) return <ErrorState title="Project not found" description="This project may have been deleted." onRetry={() => navigate("/projects")} />;

  return (
    <div>
      <button onClick={() => navigate("/projects")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to projects
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="font-sora font-bold text-2xl md:text-3xl tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground mt-1 text-sm capitalize">{project.platform} · {project.status}</p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        {projectNav.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                isActive ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </NavLink>
        ))}
      </div>

      <Outlet context={{ user, project, reload: load }} />
    </div>
  );
}