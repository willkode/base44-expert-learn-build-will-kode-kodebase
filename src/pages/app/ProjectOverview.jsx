import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import LoadingState from "@/components/shared/LoadingState";
import ProjectSummary from "@/components/project/ProjectSummary";
import ProjectMetrics from "@/components/project/ProjectMetrics";
import ProjectActivity from "@/components/project/ProjectActivity";

export default function ProjectOverview() {
  const { project, reload } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [intake, setIntake] = useState(null);
  const [promptItems, setPromptItems] = useState([]);
  const [security, setSecurity] = useState([]);
  const [qa, setQa] = useState([]);
  const [runs, setRuns] = useState([]);

  const loadData = () => {
    Promise.all([
      base44.entities.ProjectIntake.filter({ projectId: project.id }),
      base44.entities.PromptItem.filter({ projectId: project.id }),
      base44.entities.SecurityFinding.filter({ projectId: project.id }),
      base44.entities.QAItem.filter({ projectId: project.id }),
      base44.entities.AgentRun.filter({ projectId: project.id }, "-created_date", 10),
    ]).then(([i, pi, s, q, r]) => {
      setIntake(i[0] || null);
      setPromptItems(pi);
      setSecurity(s);
      setQa(q);
      setRuns(r);
      setLoading(false);
    });
  };

  useEffect(loadData, [project.id]);

  if (loading) return <LoadingState label="Loading project overview..." />;

  return (
    <div className="space-y-6">
      {promptItems.length > 0 && (
        <ProjectMetrics prompts={promptItems} security={security} qa={qa} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProjectSummary project={project} intake={intake} />
        </div>
        <div className="space-y-6">
          <ProjectActivity runs={runs} projectStatus={project.status} />
        </div>
      </div>
    </div>
  );
}