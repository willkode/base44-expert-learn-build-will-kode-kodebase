import { toast } from "sonner";

const today = () => new Date().toISOString().slice(0, 10);

export function copyText(text, message = "Copied to clipboard") {
  navigator.clipboard.writeText(text || "");
  toast.success(message);
}

export function downloadMarkdown(filename, content) {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Exported as markdown");
}

export function printContent(title, markdownHtml) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`<!doctype html><html><head><title>${title}</title>
    <style>
      body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:820px;margin:40px auto;padding:0 24px;color:#111;line-height:1.6}
      h1{font-size:28px;border-bottom:2px solid #eee;padding-bottom:8px}
      h2{font-size:20px;margin-top:32px}
      h3{font-size:16px}
      pre{white-space:pre-wrap;background:#f6f6f6;padding:12px;border-radius:8px}
      table{border-collapse:collapse;width:100%;margin:12px 0}
      th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:14px}
      th{background:#fafafa}
      .muted{color:#666;font-size:13px}
    </style></head><body>${markdownHtml}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
}

const SEVERITY_LABELS = { critical: "🔴 Critical", high: "🟠 High", medium: "🟡 Medium", low: "🔵 Low" };

// ---------- Blueprint ----------
const BLUEPRINT_SECTIONS = [
  ["Executive Summary", "executiveSummary"],
  ["App Architecture", "appArchitecture"],
  ["Entity Plan", "entityPlan"],
  ["Roles & Permissions", "rolePermissionPlan"],
  ["Page Plan", "pagePlan"],
  ["Workflows", "workflowPlan"],
  ["Backend Functions", "backendFunctionPlan"],
  ["Integrations", "integrationPlan"],
  ["MVP Roadmap", "mvpRoadmap"],
];

export function blueprintMarkdown(project, bp) {
  const lines = [
    `# ${bp.title || "Base44 Build Blueprint"}`,
    `**Project:** ${project.projectName}`,
    `**Generated:** ${today()}`,
    "",
  ];
  BLUEPRINT_SECTIONS.forEach(([label, key]) => {
    if (bp[key]) lines.push(`## ${label}\n${bp[key]}\n`);
  });
  return lines.join("\n");
}

export function blueprintSectionMarkdown(label, content) {
  return `## ${label}\n${content || ""}`;
}

// ---------- Client Report ----------
const CLIENT_REPORT_SECTIONS = [
  ["Project Overview", "executiveSummary"],
  ["Recommended Build Scope", "appArchitecture"],
  ["MVP Features", "mvpRoadmap"],
  ["User Roles", "rolePermissionPlan"],
  ["Page List", "pagePlan"],
  ["Workflow Summary", "workflowPlan"],
  ["Integration Summary", "integrationPlan"],
];

export function clientReportMarkdown(project, bp, meta = {}) {
  const lines = [`# ${project.projectName} — Project Report`, ""];
  if (meta.clientName) lines.push(`**Prepared for:** ${meta.clientName}`);
  if (meta.agencyName) lines.push(`**Prepared by:** ${meta.agencyName}`);
  if (meta.preparedBy) lines.push(`**Author:** ${meta.preparedBy}`);
  lines.push(`**Date:** ${today()}`, "");
  if (project.shortDescription) lines.push(`> ${project.shortDescription}`, "");
  CLIENT_REPORT_SECTIONS.forEach(([label, key]) => {
    if (bp[key]) lines.push(`## ${label}\n${bp[key]}\n`);
  });
  if (meta.projectNotes) lines.push(`## Project Notes\n${meta.projectNotes}\n`);
  lines.push(
    `## Estimated Build Phases`,
    bp.mvpRoadmap ? "See MVP Features above for phased build order." : "Phased delivery to be confirmed during kickoff.",
    "",
    `## Risk Notes`,
    "Key risks and mitigations will be reviewed before development begins.",
    "",
    `## Next Steps`,
    "1. Review and approve this report.\n2. Confirm scope and timeline.\n3. Begin MVP development.",
    ""
  );
  return lines.join("\n");
}

// ---------- Prompt Pack ----------
export function promptPackMarkdown(project, pack, items) {
  const lines = [
    `# ${pack.title || "Prompt Pack"}`,
    `**Project:** ${project.projectName}`,
    `**Generated:** ${today()}`,
    pack.description ? `\n${pack.description}` : "",
    "",
  ];
  items.forEach((p) => {
    lines.push(`## Prompt ${p.promptNumber}: ${p.title}`);
    if (p.category) lines.push(`**Category:** ${p.category}`);
    if (p.purpose) lines.push(`**Purpose:** ${p.purpose}`);
    if (p.dependencies) lines.push(`**Depends on:** ${p.dependencies}`);
    lines.push(`\n${p.promptText || ""}\n`);
  });
  return lines.join("\n");
}

export function allPromptsText(items) {
  return items
    .map((p) => `--- Prompt ${p.promptNumber}: ${p.title} ---\n\n${p.promptText || ""}`)
    .join("\n\n");
}

// ---------- Security ----------
export function securityMarkdown(project, findings) {
  const lines = [
    `# Security Review`,
    `**Project:** ${project.projectName}`,
    `**Generated:** ${today()}`,
    `**Findings:** ${findings.length}`,
    "",
    `| Severity | Area | Status | Issue |`,
    `| --- | --- | --- | --- |`,
  ];
  findings.forEach((f) => {
    lines.push(`| ${SEVERITY_LABELS[f.severity] || f.severity} | ${f.area || ""} | ${f.fixedStatus || "open"} | ${(f.issue || "").replace(/\n/g, " ")} |`);
  });
  lines.push("");
  findings.forEach((f) => {
    lines.push(`## ${SEVERITY_LABELS[f.severity] || f.severity} — ${f.area || ""}`);
    if (f.issue) lines.push(`**Issue:** ${f.issue}`);
    if (f.risk) lines.push(`**Risk:** ${f.risk}`);
    if (f.recommendation) lines.push(`**Recommendation:** ${f.recommendation}`);
    lines.push(`**Status:** ${f.fixedStatus || "open"}\n`);
  });
  return lines.join("\n");
}

export function securityFindingsText(findings) {
  return findings
    .map((f) => `[${(SEVERITY_LABELS[f.severity] || f.severity)}] ${f.area}\nIssue: ${f.issue}\nRisk: ${f.risk}\nFix: ${f.recommendation}\nStatus: ${f.fixedStatus || "open"}`)
    .join("\n\n");
}

// ---------- QA ----------
export function qaMarkdown(project, items) {
  const total = items.length;
  const passed = items.filter((i) => i.status === "passed").length;
  const failed = items.filter((i) => i.status === "failed").length;
  const readiness = total ? Math.round((passed / total) * 100) : 0;
  const lines = [
    `# QA Checklist`,
    `**Project:** ${project.projectName}`,
    `**Generated:** ${today()}`,
    `**Total:** ${total} · **Passed:** ${passed} · **Failed:** ${failed} · **Readiness:** ${readiness}%`,
    "",
    `| Category | Test | Status | Expected Result |`,
    `| --- | --- | --- | --- |`,
  ];
  items.forEach((i) => {
    lines.push(`| ${i.category || ""} | ${i.testName || ""} | ${i.status || "pending"} | ${(i.expectedResult || "").replace(/\n/g, " ")} |`);
  });
  return lines.join("\n");
}