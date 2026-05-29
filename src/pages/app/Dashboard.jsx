import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { FolderKanban, FileText, Boxes, ShieldCheck, FolderPlus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import LoadingState from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/button";
import StartBlueprintCard from "@/components/dashboard/StartBlueprintCard";
import HowItWorks from "@/components/dashboard/HowItWorks";
import RecentProjects from "@/components/dashboard/RecentProjects";
import RecentPromptPacks from "@/components/dashboard/RecentPromptPacks";

export default function Dashboard() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [blueprints, setBlueprints] = useState([]);
  const [packs, setPacks] = useState([]);
  const [securityReviews, setSecurityReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Project.list("-updated_date", 50),
      base44.entities.Blueprint.list("-created_date", 100),
      base44.entities.PromptPack.list("-created_date", 50),
      base44.entities.SecurityFinding.list("-created_date", 100),
    ]).then(([p, b, pp, sf]) => {
      setProjects(p);
      setBlueprints(b);
      setPacks(pp);
      setSecurityReviews(sf);
      setLoading(false);
    });
  }, []);

  const completedBlueprints = blueprints.filter((b) => b.status === "complete").length;
  const reviewedProjects = new Set(securityReviews.map((s) => s.projectId)).size;

  return (
    <div>
      <PageHeader
        title={`Welcome${user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}`}
        description="Your AI software architecture workspace for Base44 builders."
        actions={
          <Button onClick={() => navigate("/projects/new")} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            <FolderPlus className="w-4 h-4 mr-2" /> New Project
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard icon={FolderKanban} label="Total Projects" value={loading ? "—" : projects.length} />
        <StatCard icon={FileText} label="Completed Blueprints" value={loading ? "—" : completedBlueprints} />
        <StatCard icon={Boxes} label="Prompt Packs Generated" value={loading ? "—" : packs.length} />
        <StatCard icon={ShieldCheck} label="Security Reviews" value={loading ? "—" : reviewedProjects} />
      </div>

      <StartBlueprintCard />

      {loading ? (
        <LoadingState label="Loading your workspace..." />
      ) : (
        <>
          <RecentProjects projects={projects} />
          <HowItWorks />
          <RecentPromptPacks packs={packs} />
        </>
      )}
    </div>
  );
}