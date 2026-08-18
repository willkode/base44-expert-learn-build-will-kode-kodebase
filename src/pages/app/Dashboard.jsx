import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Package, ShieldCheck, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import LoadingState from "@/components/shared/LoadingState";
import DashboardHero from "@/components/dashboard/DashboardHero";
import DashboardStats from "@/components/dashboard/DashboardStats";
import SectionHeading from "@/components/dashboard/SectionHeading";
import RecentPromptPacks from "@/components/dashboard/RecentPromptPacks";
import PromptVaultBanner from "@/components/dashboard/PromptVaultBanner";
import MyProducts from "@/components/dashboard/MyProducts";
import DesktopDownloadCard from "@/components/dashboard/DesktopDownloadCard";
import PurchaseThankYouDialog from "@/components/dashboard/PurchaseThankYouDialog";
import ProductsCtaBanner from "@/components/shared/ProductsCtaBanner";

export default function Dashboard() {
  const { user } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [packs, setPacks] = useState([]);
  const [security, setSecurity] = useState([]);
  const [hasVaultAccess, setHasVaultAccess] = useState(false);

  useEffect(() => {
    const init = async () => {
      const [p, pk, s] = await Promise.all([
        base44.entities.Project.list("-updated_date", 50),
        base44.entities.PromptPack.list("-created_date", 50),
        base44.entities.SecurityFinding.list("-created_date", 200),
      ]);
      setProjects(p);
      setPacks(pk);
      setSecurity(s);
      if (user?.id) {
        const res = await base44.functions.invoke("checkVaultAccess", {});
        setHasVaultAccess(!!res.data?.hasAccess);
      }
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, [user?.id]);

  const reviewedProjects = new Set(security.map((s) => s.projectId)).size;

  if (loading) return <LoadingState label="Loading dashboard..." />;

  return (
    <div className="space-y-8 sm:space-y-10">
      <PurchaseThankYouDialog />

      <DashboardHero
        title={`Welcome${user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}`}
        description="Your Base44 workspace."
      />

      <DesktopDownloadCard />

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3 xl:gap-8">
        <div className="space-y-8 sm:space-y-10 xl:col-span-2">
          <DashboardStats
            items={[
              { icon: Package, label: "Prompt Packs Generated", value: packs.length },
              { icon: ShieldCheck, label: "Security Reviews", value: reviewedProjects },
            ]}
          />

          <MyProducts userId={user?.id} />

          <section>
            <SectionHeading icon={Sparkles}>Recent Prompt Packs</SectionHeading>
            <RecentPromptPacks packs={packs.slice(0, 5)} />
          </section>
        </div>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <PromptVaultBanner hasAccess={hasVaultAccess} />
        </aside>
      </div>

      <ProductsCtaBanner
        location="dashboard"
        title="Level up your builds"
        description="Ready-made prompt packs and complete systems to take your next app from idea to launch faster."
      />
    </div>
  );
}