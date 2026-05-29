import React, { useState, useEffect } from "react";
import { Users, FolderKanban, Boxes, ScrollText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import LoadingState from "@/components/shared/LoadingState";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.User.list("-created_date", 500),
      base44.entities.Project.list("-created_date", 500),
      base44.entities.Blueprint.list("-created_date", 500),
      base44.entities.AgentRun.list("-created_date", 500),
    ]).then(([users, projects, blueprints, logs]) => {
      setStats({ users: users.length, projects: projects.length, blueprints: blueprints.length, logs: logs.length });
    });
  }, []);

  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Platform overview and activity." />
      {!stats ? (
        <LoadingState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard icon={Users} label="Users" value={stats.users} />
          <StatCard icon={FolderKanban} label="Projects" value={stats.projects} />
          <StatCard icon={Boxes} label="Blueprints" value={stats.blueprints} />
          <StatCard icon={ScrollText} label="AI Runs" value={stats.logs} />
        </div>
      )}
    </div>
  );
}