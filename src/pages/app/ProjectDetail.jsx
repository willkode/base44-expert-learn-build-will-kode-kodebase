import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Outlet, NavLink, useOutletContext } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import StatusBadge from "@/components/project/StatusBadge";
import { projectNav } from "@/components/layout/navConfig";
import ProjectChatWidget from "@/components/chat/ProjectChatWidget";
import { ChatWidgetProvider, useChatWidget } from "@/components/chat/ChatWidgetContext";

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

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="font-sora font-bold text-2xl md:text-3xl tracking-tight">{project.projectName}</h1>
            <StatusBadge status={project.status} />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="capitalize">{project.platformFocus || "Base44"}{project.appType ? ` · ${project.appType}` : ""}</span>
            {project.created_date && <span>· Created {format(new Date(project.created_date), "MMM d, yyyy")}</span>}
            {project.updated_date && <span>· Updated {format(new Date(project.updated_date), "MMM d, yyyy")}</span>}
          </div>
        </div>
        <Button
          asChild
          className="shrink-0 bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold"
        >
          <a href="https://discord.com/invite/cwEv93EwBA" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" className="w-4 h-4 mr-1" fill="currentColor" aria-hidden="true">
              <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.6 12.6 0 0 0-.617-1.249.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.056c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028ZM8.02 15.331c-1.182 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.332-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.332-.946 2.418-2.157 2.418Z" />
            </svg>
            Join our Discord
          </a>
        </Button>
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

      <ChatWidgetProvider>
        <ProjectOutlet user={user} project={project} reload={load} />
        <ProjectChatWidget project={project} />
      </ChatWidgetProvider>
    </div>
  );
}

function ProjectOutlet({ user, project, reload }) {
  const { openChatWith } = useChatWidget();
  return <Outlet context={{ user, project, reload, openChatWith }} />;
}