import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import LoadingState from "@/components/shared/LoadingState";
import ProjectActions from "@/components/project/ProjectActions";
import GenerationProgress from "@/components/project/GenerationProgress";
import ProjectSummary from "@/components/project/ProjectSummary";
import ProjectMetrics, { getLaunchReady } from "@/components/project/ProjectMetrics";
import LaunchAuditBanner from "@/components/project/LaunchAuditBanner";
import LaunchCelebrationDialog from "@/components/project/LaunchCelebrationDialog";
import BlueprintProgress from "@/components/project/BlueprintProgress";
import ProjectActivity from "@/components/project/ProjectActivity";
import PlanUsageCard from "@/components/plan/PlanUsageCard";
import UpgradeCard from "@/components/plan/UpgradeCard";
import { getBlueprintUsage } from "@/lib/plans";

export default function ProjectOverview() {
  const { project, reload } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [intake, setIntake] = useState(null);
  const [blueprint, setBlueprint] = useState(null);
  const [promptPack, setPromptPack] = useState(null);
  const [promptItems, setPromptItems] = useState([]);
  const [security, setSecurity] = useState([]);
  const [qa, setQa] = useState([]);
  const [runs, setRuns] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(null);
  const [celebrate, setCelebrate] = useState(false);
  const [rerunning, setRerunning] = useState(null);

  const loadData = () => {
    Promise.all([
      base44.entities.ProjectIntake.filter({ projectId: project.id }),
      base44.entities.Blueprint.filter({ projectId: project.id }, "-created_date", 1),
      base44.entities.PromptPack.filter({ projectId: project.id }, "-created_date", 1),
      base44.entities.PromptItem.filter({ projectId: project.id }),
      base44.entities.SecurityFinding.filter({ projectId: project.id }),
      base44.entities.QAItem.filter({ projectId: project.id }),
      base44.entities.AgentRun.filter({ projectId: project.id }, "-created_date", 10),
      base44.entities.UserProfile.filter({ userId: project.ownerId }, "-created_date", 1),
      base44.auth.me(),
    ]).then(([i, b, pp, pi, s, q, r, prof, me]) => {
      setIntake(i[0] || null);
      setBlueprint(b[0] || null);
      setPromptPack(pp[0] || null);
      setPromptItems(pi);
      setSecurity(s);
      setQa(q);
      setRuns(r);
      setProfile(prof[0] || null);
      setIsAdmin(me?.role === "admin");
      setLoading(false);
    });
  };

  useEffect(loadData, [project.id]);

  // Celebrate the first time this project hits 100% launch ready (once per project).
  useEffect(() => {
    if (loading || !blueprint) return;
    if (getLaunchReady(promptItems, security, qa) !== 100) return;
    const key = `launchCelebrated_${project.id}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
    setCelebrate(true);
  }, [loading, blueprint, promptItems, security, qa, project.id]);

  const handleGenerate = async () => {
    setGenerating(true);
    setProgress(null);
    // Clear stale results from the previous blueprint immediately so the
    // "100% complete" banner/metrics don't linger while the new one generates.
    setBlueprint(null);
    setPromptPack(null);
    setPromptItems([]);
    setSecurity([]);
    setQa([]);
    localStorage.removeItem(`launchCelebrated_${project.id}`);
    try {
      // Generation runs one agent per request to avoid timeouts.
      // Keep calling until the backend reports done.
      let done = false;
      let safety = 0;
      while (!done && safety < 20) {
        safety += 1;
        const res = await base44.functions.invoke("generateBlueprint", {
          projectId: project.id,
          intake,
          profile,
          // First call starts a fresh cycle and wipes any existing blueprint so it's overridden.
          restart: safety === 1,
        });
        if (res.data?.error) throw new Error(res.data.error);
        const data = res.data || {};
        if (data.total) setProgress({ completed: data.completed, total: data.total, currentAgent: data.currentAgent });
        done = !!data.done;
      }
      toast.success("Blueprint generated successfully");
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || "Blueprint generation failed");
    } finally {
      setProgress(null);
      if (reload) reload();
      loadData();
      setGenerating(false);
    }
  };

  const handleRerun = async (agentName) => {
    setRerunning(agentName);
    try {
      if (agentName === "Security Agent") {
        const res = await base44.functions.invoke("runSecurityReview", { projectId: project.id });
        if (res.data?.error) throw new Error(res.data.error);
        toast.success("Security review re-run completed");
      } else if (agentName === "QA Agent") {
        const res = await base44.functions.invoke("runQAChecklist", { projectId: project.id });
        if (res.data?.error) throw new Error(res.data.error);
        toast.success("QA checklist re-run completed");
      } else {
        // Architect, Prompt Engineer and Optimization agents run as part of blueprint generation.
        await handleGenerate();
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || "Re-run failed");
    } finally {
      setRerunning(null);
      loadData();
    }
  };

  if (loading) return <LoadingState label="Loading project overview..." />;

  const usage = getBlueprintUsage(profile);
  // Existing blueprint can always be re-viewed; the limit only blocks NEW generation.
  const limitReached = !isAdmin && !blueprint && usage.reached;

  const bp = blueprint || {};
  const steps = [
    { label: "Intake completed", done: !!intake },
    { label: "Architecture generated", done: !!bp.appArchitecture },
    { label: "Entity plan generated", done: !!bp.entityPlan },
    { label: "Permission plan generated", done: !!bp.rolePermissionPlan },
    { label: "Prompt pack generated", done: !!promptPack },
    { label: "Security review generated", done: security.length > 0 },
    { label: "QA checklist generated", done: qa.length > 0 },
  ];

  return (
    <div className="space-y-6">
      <LaunchCelebrationDialog
        open={celebrate}
        onOpenChange={setCelebrate}
        appName={project.projectName}
        appUrl={project.appUrl}
      />

      {limitReached ? (
        <UpgradeCard
          title="Blueprint limit reached"
          description={`Your ${profile?.plan || "free"} plan allows ${usage.limit} blueprint${usage.limit === 1 ? "" : "s"}. Upgrade to generate more.`}
          suggestedPlan={(profile?.plan || "free") === "free" ? "Pro" : "Agency"}
        />
      ) : (
        <ProjectActions
          project={project}
          hasBlueprint={!!blueprint}
          hasPromptPack={!!promptPack}
          generating={generating}
          progress={progress}
          onGenerate={handleGenerate}
        />
      )}

      {generating && <GenerationProgress progress={progress} />}

      {blueprint && getLaunchReady(promptItems, security, qa) === 100 && (
        <LaunchAuditBanner projectId={project.id} onOrder={() => toast.success("Audit request received — our team will reach out shortly.")} />
      )}

      {blueprint && (
        <ProjectMetrics prompts={promptItems} security={security} qa={qa} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProjectSummary project={project} intake={intake} />
        </div>
        <div className="space-y-6">
          {!isAdmin && <PlanUsageCard profile={profile} />}
          <BlueprintProgress steps={steps} />
          <ProjectActivity runs={runs} projectStatus={project.status} onRerun={handleRerun} rerunning={rerunning} />
        </div>
      </div>
    </div>
  );
}