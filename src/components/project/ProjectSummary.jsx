import React from "react";

function Row({ label, value }) {
  return (
    <div className="py-3 border-b border-border last:border-0">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{label}</dt>
      <dd className="text-sm text-foreground whitespace-pre-wrap">{value || "—"}</dd>
    </div>
  );
}

export default function ProjectSummary({ project, intake }) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-6">
      <h3 className="font-sora font-semibold text-lg mb-2">Project summary</h3>
      <dl>
        <Row label="App description" value={intake?.appDescription || project.shortDescription} />
        <Row label="Target users" value={intake?.targetAudience || project.targetUsers} />
        <Row label="Roles" value={intake?.userRoles} />
        <Row label="Main features" value={intake?.mainFeatures} />
        <Row label="Integrations" value={intake?.integrationsNeeded} />
        <Row label="Security level" value={intake?.securityLevel} />
        <Row label="Launch goal" value={intake?.launchGoal} />
      </dl>
    </div>
  );
}