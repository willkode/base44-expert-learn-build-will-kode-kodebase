import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import WizardProgress from "@/components/wizard/WizardProgress";
import Step1Basics from "@/components/wizard/Step1Basics";
import Step2Users from "@/components/wizard/Step2Users";
import Step3Features from "@/components/wizard/Step3Features";
import Step4Data from "@/components/wizard/Step4Data";
import Step5Integrations from "@/components/wizard/Step5Integrations";
import Step6Security from "@/components/wizard/Step6Security";

const STEP_LABELS = ["App Basics", "Users & Roles", "Core Features", "Data & Workflows", "Integrations", "Security & Launch"];

export default function NewProject() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({ securityLevel: "standard" });

  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const validateStep = () => {
    if (step === 0) {
      if (!data.appName?.trim()) return "App name is required.";
      if (!data.shortDescription?.trim()) return "Short description is required.";
      if (!data.appType) return "Please select an app type.";
    }
    if (step === 1 && !data.targetAudience?.trim()) return "Target users is required.";
    if (step === 2 && !data.mainFeatures?.trim()) return "Main features is required.";
    if (step === 3 && !data.dataStored?.trim()) return "Please describe what data needs to be stored.";
    return "";
  };

  const next = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  };

  const back = () => { setError(""); setStep((s) => Math.max(s - 1, 0)); };

  const handleSubmit = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setSaving(true);
    setError("");

    const user = await base44.auth.me();

    const project = await base44.entities.Project.create({
      ownerId: user.id,
      projectName: data.appName,
      appType: data.appType,
      shortDescription: data.shortDescription,
      targetUsers: data.targetAudience,
      platformFocus: "Base44",
      status: "draft",
      currentStep: 1,
    });

    await base44.entities.ProjectIntake.create({
      projectId: project.id,
      ownerId: user.id,
      appName: data.appName,
      appDescription: data.shortDescription,
      targetAudience: data.targetAudience,
      userRoles: data.userRoles,
      mainFeatures: data.mainFeatures,
      adminNeeds: data.adminFeatures,
      integrationsNeeded: data.externalApis,
      paymentNeeds: data.paymentIntegration ? "Yes" : "No",
      aiFeaturesNeeded: data.aiFeatures,
      securityLevel: data.securityLevel || "standard",
      launchGoal: data.launchGoal,
      notes: data.notes,
      stepData: data,
    });

    navigate(`/projects/${project.id}`);
  };

  const steps = [
    <Step1Basics data={data} set={set} />,
    <Step2Users data={data} set={set} />,
    <Step3Features data={data} set={set} />,
    <Step4Data data={data} set={set} />,
    <Step5Integrations data={data} set={set} />,
    <Step6Security data={data} set={set} />,
  ];

  const isLast = step === STEP_LABELS.length - 1;

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="New Project" description="Answer a few questions — the AI Base44 Architect will plan the rest." />

      <WizardProgress steps={STEP_LABELS} current={step} />

      <div className="rounded-2xl border border-border bg-card/60 p-6 md:p-8">
        <h2 className="font-sora font-semibold text-lg mb-5">{STEP_LABELS[step]}</h2>
        {steps[step]}

        {error && <p className="text-sm text-destructive mt-4">{error}</p>}

        <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-border">
          {step === 0 ? (
            <Button variant="outline" type="button" onClick={() => navigate("/projects")}>Cancel</Button>
          ) : (
            <Button variant="outline" type="button" onClick={back}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          )}

          {isLast ? (
            <Button onClick={handleSubmit} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : <><Sparkles className="w-4 h-4 mr-2" /> Create Project</>}
            </Button>
          ) : (
            <Button onClick={next} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}