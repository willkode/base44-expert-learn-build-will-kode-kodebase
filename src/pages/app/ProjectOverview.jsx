import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import LoadingState from "@/components/shared/LoadingState";
import ProjectActions from "@/components/project/ProjectActions";
import ProjectSummary from "@/components/project/ProjectSummary";
import BlueprintProgress from "@/components/project/BlueprintProgress";
import ProjectActivity from "@/components/project/ProjectActivity";

export default function ProjectOverview() {
  const { project, reload } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [intake, setIntake] = useState(null);
  const [blueprint, setBlueprint] = useState(null);
  const [promptPack, setPromptPack] = useState(null);
  const [security, setSecurity] = useState([]);
  const [qa, setQa] = useState([]);
  const [runs, setRuns] = useState([]);
  const [generating, setGenerating] = useState(false);

  const loadData = () => {
    Promise.all([
      base44.entities.ProjectIntake.filter({ projectId: project.id }),
      base44.entities.Blueprint.filter({ projectId: project.id }, "-created_date", 1),
      base44.entities.PromptPack.filter({ projectId: project.id }, "-created_date", 1),
      base44.entities.SecurityFinding.filter({ projectId: project.id }),
      base44.entities.QAItem.filter({ projectId: project.id }),
      base44.entities.AgentRun.filter({ projectId: project.id }, "-created_date", 10),
    ]).then(([i, b, pp, s, q, r]) => {
      setIntake(i[0] || null);
      setBlueprint(b[0] || null);
      setPromptPack(pp[0] || null);
      setSecurity(s);
      setQa(q);
      setRuns(r);
      setLoading(false);
    });
  };

  useEffect(loadData, [project.id]);

  const handleGenerate = async () => {
    setGenerating(true);
    await base44.entities.AgentRun.create({
      projectId: project.id,
      ownerId: project.ownerId,
      agentName: "Base44 Architect",
      inputSummary: `Generate blueprint for ${project.projectName}`,
      status: "pending",
    });
    await base44.entities.Project.update(project.id, { status: "generating" });
    if (reload) reload();
    loadData();
    setGenerating(false);
  };

  if (loading) return <LoadingState label="Loading project overview..." />;

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
      <ProjectActions
        project={project}
        hasBlueprint={!!blueprint}
        hasPromptPack={!!promptPack}
        generating={generating}
        onGenerate={handleGenerate}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProjectSummary project={project} intake={intake} />
        </div>
        <div className="space-y-6">
          <BlueprintProgress steps={steps} />
          <ProjectActivity runs={runs} />
        </div>
      </div>
    </div>
  );
}