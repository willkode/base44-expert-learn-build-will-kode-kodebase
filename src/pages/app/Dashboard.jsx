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
import PromptVaultBanner from "@/components/dashboard/PromptVaultBanner";

export default function Dashboard() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [blueprints, setBlueprints] = useState([]);
  const [packs, setPacks] = useState([]);
  const [security, setSecurity] = useState([]);
  const [hasVaultAccess, setHasVaultAccess] = useState(false);

  const VAULT_PRODUCT_ID = "6a36c8c785752800bd7580be";

  useEffect(() => {
    const init = async () => {
      const [p, b, pk, s] = await Promise.all([
        base44.entities.Project.list("-updated_date", 50),
        base44.entities.Blueprint.list("-created_date", 100),
        base44.entities.PromptPack.list("-created_date", 50),
        base44.entities.SecurityFinding.list("-created_date", 200),
      ]);
      setProjects(p);
      setBlueprints(b);
      setPacks(pk);
      setSecurity(s);
      // Check vault access
      if (user?.id) {
        const payments = await base44.entities.Payment.filter({ userId: user.id, productId: VAULT_PRODUCT_ID, status: "completed" }, "-created_date", 1);
        setHasVaultAccess(payments.length > 0);
      }
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, [user?.id]);

  const completedBlueprints = blueprints.filter((b) => b.status === "completed").length;
  const reviewedProjects = new Set(security.map((s) => s.projectId)).size;

  if (loading) return <LoadingState label="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 mb-10 flex-wrap">
        <PageHeader
          title={`Welcome${user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}`}
          description="Your AI Base44 architecture workspace."
        />
        <div className="flex items-center gap-3 shrink-0">
        <Button onClick={() => navigate("/projects/new")} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
          <FolderPlus className="w-4 h-4 mr-2" /> New Project
        </Button>
        <Button
          asChild
          className="shrink-0 bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] hover:opacity-90 text-white font-semibold border-0"
        >
          <a href="https://discord.com/invite/cwEv93EwBA" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" className="w-4 h-4 mr-1" fill="currentColor" aria-hidden="true">
              <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.6 12.6 0 0 0-.617-1.249.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.056c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028ZM8.02 15.331c-1.182 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.332-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.332-.946 2.418-2.157 2.418Z" />
            </svg>
            Join our Discord
          </a>
        </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={FolderKanban} label="Total Projects" value={projects.length} />
        <StatCard icon={FileText} label="Completed Blueprints" value={completedBlueprints} />
        <StatCard icon={Package} label="Prompt Packs Generated" value={packs.length} />
        <StatCard icon={ShieldCheck} label="Security Reviews" value={reviewedProjects} />
      </div>

      <PromptVaultBanner hasAccess={hasVaultAccess} />

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