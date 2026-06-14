import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { ClipboardList, Plus, Sparkles } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CreatePlanWizard from "@/components/admin/blog/plans/CreatePlanWizard";
import PlanPreviewDialog from "@/components/admin/blog/plans/PlanPreviewDialog";

export default function BlogPlans() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [activePlan, setActivePlan] = useState(null);

  const load = useCallback(async () => {
    const d = await base44.entities.BlogContentPlan.list("-created_date", 500);
    setRows(d);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const ideaCount = (p) => (Array.isArray(p.plannedPosts) ? p.plannedPosts.length : 0);
  const createdCount = (p) => (Array.isArray(p.plannedPosts) ? p.plannedPosts.filter((i) => i.status === "created").length : 0);

  const onPlanGenerated = async (plan) => {
    await load();
    setActivePlan(plan);
  };

  const onPlanSaved = (plan) => {
    setActivePlan(plan);
    setRows((r) => r.map((x) => (x.id === plan.id ? plan : x)));
  };

  return (
    <div>
      <PageHeader
        title="Content Plans"
        description="Create AI editorial plans, generate post ideas, and auto-fill your publishing calendar."
        actions={
          <Button className="gap-2" onClick={() => setWizardOpen(true)}>
            <Plus className="w-4 h-4" /> New plan
          </Button>
        }
      />
      <AdminTable
        columns={["Name", "Goal", "Ideas", "Status", "Dates", ""]}
        rows={rows}
        loading={loading}
        emptyIcon={ClipboardList}
        emptyTitle="No content plans yet"
        emptyDescription="Plan out topic clusters and publishing campaigns to drive consistent SEO growth."
        renderRow={(p) => [
          <div className="font-medium">{p.name}</div>,
          <span className="text-xs text-muted-foreground capitalize">{(p.goal || "").replace(/_/g, " ")}</span>,
          <span className="text-xs text-muted-foreground">{createdCount(p)}/{ideaCount(p)} created</span>,
          <Badge variant="secondary" className="text-xs capitalize">{(p.status || "draft").replace(/_/g, " ")}</Badge>,
          <span className="text-xs text-muted-foreground">{p.startDate || "—"} → {p.endDate || "—"}</span>,
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setActivePlan(p)}>
            <Sparkles className="w-3.5 h-3.5" /> Open
          </Button>,
        ]}
      />

      <CreatePlanWizard open={wizardOpen} onOpenChange={setWizardOpen} onPlanGenerated={onPlanGenerated} />
      <PlanPreviewDialog
        open={!!activePlan}
        onOpenChange={(v) => !v && setActivePlan(null)}
        plan={activePlan}
        onSaved={onPlanSaved}
      />
    </div>
  );
}