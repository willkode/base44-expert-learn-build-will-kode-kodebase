import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { FolderKanban, FileText, Package, ShieldCheck, FolderPlus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import LoadingState from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/button";
import RecentProjects from "@/components/dashboard/RecentProjects";
import StartBlueprintCard from "@/components/dashboard/StartBlueprintCard";
import HowItWorks from "@/components/dashboard/HowItWorks";
import RecentPromptPacks from "@/components/dashboard/RecentPromptPacks";

export default function Dashboard() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [blueprints, setBlueprints] = useState([]);
  const [packs, setPacks] = useState([]);
  const [security, setSecurity] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.Project.list("-updated_date", 50),
      base44.entities.Blueprint.list("-created_date", 100),
      base44.entities.PromptPack.list("-created_date", 50),
      base44.entities.SecurityFinding.list("-created_date", 200),
    ]).then(([p, b, pk, s]) => {
      setProjects(p);
      setBlueprints(b);
      setPacks(pk);
      setSecurity(s);
      setLoading(false);
    });
  }, []);

  const completedBlueprints = blueprints.filter((b) => b.status === "completed").length;
  const reviewedProjects = new Set(security.map((s) => s.projectId)).size;

  if (loading) return <LoadingState label="Loading dashboard..." />;

  return (
    <div className="space-y-10">
      <PageHeader
        title={`Welcome${user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}`}
        description="Your AI Base44 architecture workspace."
        actions={
          <Button onClick={() => navigate("/projects/new")} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            <FolderPlus className="w-4 h-4 mr-2" /> New Project
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={FolderKanban} label="Total Projects" value={projects.length} />
        <StatCard icon={FileText} label="Completed Blueprints" value={completedBlueprints} />
        <StatCard icon={Package} label="Prompt Packs Generated" value={packs.length} />
        <StatCard icon={ShieldCheck} label="Security Reviews" value={reviewedProjects} />
      </div>

      <StartBlueprintCard />

      <section>
        <h2 className="font-sora font-semibold text-lg mb-4">Recent Projects</h2>
        <RecentProjects projects={projects.slice(0, 5)} />
      </section>

      <section>
        <h2 className="font-sora font-semibold text-lg mb-4">How It Works</h2>
        <HowItWorks />
      </section>

      <section>
        <h2 className="font-sora font-semibold text-lg mb-4">Recent Prompt Packs</h2>
        <RecentPromptPacks packs={packs.slice(0, 5)} />
      </section>
    </div>
  );
}