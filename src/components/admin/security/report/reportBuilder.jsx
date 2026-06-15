// Builds the Security Audit Report model + a plain-text version for copy/print.
// Pure functions — no side effects, no data fetching.

import { SEVERITY_ORDER } from "@/components/admin/security/securityConfig";

export const CLIENT_SUMMARY =
  "This report identifies likely access control, route protection, entity exposure, role permission, and user data isolation risks based on the app's configured security registry and scan results.";

export const REPORT_DISCLAIMER =
  "This report is a practical app-level security review and does not replace a full third-party penetration test, infrastructure audit, legal compliance review, or enterprise security assessment.";

// Recommended order in which issues should be addressed.
export const FIX_ORDER = [
  { key: "critical", label: "Critical issues", match: (i) => i.severity === "Critical" },
  { key: "high", label: "High issues", match: (i) => i.severity === "High" },
  { key: "data_isolation", label: "User data isolation issues", match: (i) => i.category === "User Data Isolation" },
  { key: "admin_lockdown", label: "Admin lockdown issues", match: (i) => i.category === "Admin Lockdown" },
  { key: "entity_exposure", label: "Entity exposure issues", match: (i) => i.category === "Entity Exposure" || i.category === "Public Data Leak" },
  { key: "role_access", label: "Role-based access issues", match: (i) => i.category === "Role-Based Access" || i.category === "Dangerous Action" },
  { key: "med_low", label: "Medium and low improvements", match: (i) => i.severity === "Medium" || i.severity === "Low" || i.severity === "Info" },
];

const OPEN_STATUSES = ["Open", "In Progress", "Needs Retest"];

export function scoreLabel(score) {
  if (score == null) return "Not Scored";
  if (score >= 90) return "Launch Ready";
  if (score >= 75) return "Mostly Secure";
  if (score >= 60) return "Needs Review";
  if (score >= 40) return "High Risk";
  return "Critical Risk";
}

export const SCORE_BANDS = [
  { range: "90–100", label: "Launch Ready" },
  { range: "75–89", label: "Mostly Secure" },
  { range: "60–74", label: "Needs Review" },
  { range: "40–59", label: "High Risk" },
  { range: "0–39", label: "Critical Risk" },
];

function fmtDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// Build a structured report model from a scan, its issues, and the registry.
export function buildReportModel(scan, allIssues, registry = []) {
  const issues = allIssues.filter((i) => i.scan_id === scan.id);

  const routesReviewed = registry.filter((r) => r.item_type === "Route").length;
  const entitiesReviewed = registry.filter((r) => r.item_type === "Entity").length;
  const rolesReviewed = registry.filter((r) => r.item_type === "Role").length;

  const bySeverity = {};
  for (const sev of SEVERITY_ORDER) bySeverity[sev] = issues.filter((i) => i.severity === sev).length;

  const byStatus = {
    open: issues.filter((i) => OPEN_STATUSES.includes(i.status)).length,
    fixed: issues.filter((i) => i.status === "Fixed").length,
    needsRetest: issues.filter((i) => i.status === "Needs Retest").length,
  };

  const score = scan.overall_score != null ? Math.round(scan.overall_score) : null;
  const label = scoreLabel(score);

  // Recommended fix order — dedupe issues across buckets.
  const seen = new Set();
  const fixOrder = FIX_ORDER.map((bucket) => {
    const matched = issues.filter((i) => bucket.match(i) && OPEN_STATUSES.includes(i.status) && !seen.has(i.id));
    matched.forEach((i) => seen.add(i.id));
    return { label: bucket.label, issues: matched };
  }).filter((b) => b.issues.length > 0);

  // Retest checklist — anything not yet confirmed fixed.
  const retestItems = issues.filter((i) => i.status !== "Ignored" && i.status !== "False Positive");

  return {
    scan,
    issues,
    scanDate: fmtDate(scan.completed_at || scan.started_at),
    score,
    label,
    scope: { routesReviewed, entitiesReviewed, rolesReviewed },
    bySeverity,
    byStatus,
    fixOrder,
    retestItems,
  };
}

// Plain-text version for copy + fallback.
export function reportToPlainText(model) {
  const L = [];
  const hr = "=".repeat(48);
  L.push("SECURITY AUDIT REPORT");
  L.push(hr);
  L.push("");
  L.push("EXECUTIVE SUMMARY");
  L.push(`Scan Date: ${model.scanDate}`);
  L.push(`Overall Security Score: ${model.score != null ? model.score + "/100" : "Not scored"}`);
  L.push(`Status: ${model.label}`);
  L.push("");
  L.push(CLIENT_SUMMARY);
  L.push("");

  L.push("SCOPE REVIEWED");
  L.push(`- Routes reviewed: ${model.scope.routesReviewed}`);
  L.push(`- Entities reviewed: ${model.scope.entitiesReviewed}`);
  L.push(`- Roles reviewed: ${model.scope.rolesReviewed}`);
  L.push("");

  L.push("ISSUES BY SEVERITY");
  L.push(`- Critical: ${model.bySeverity.Critical || 0}`);
  L.push(`- High: ${model.bySeverity.High || 0}`);
  L.push(`- Medium: ${model.bySeverity.Medium || 0}`);
  L.push(`- Low: ${model.bySeverity.Low || 0}`);
  L.push("");
  L.push("ISSUES BY STATUS");
  L.push(`- Open: ${model.byStatus.open}`);
  L.push(`- Fixed: ${model.byStatus.fixed}`);
  L.push(`- Needs Retest: ${model.byStatus.needsRetest}`);
  L.push("");

  if (model.fixOrder.length) {
    L.push("RECOMMENDED FIX ORDER");
    let n = 1;
    for (const bucket of model.fixOrder) {
      L.push(`${n}. ${bucket.label} (${bucket.issues.length})`);
      for (const i of bucket.issues) L.push(`   - ${i.title}`);
      n += 1;
    }
    L.push("");
  }

  if (model.issues.length) {
    L.push("ISSUE SUMMARIES");
    L.push("-".repeat(48));
    for (const i of model.issues) {
      L.push(`[${i.severity}] ${i.title}`);
      L.push(`Category: ${i.category}`);
      if (i.location) L.push(`Location: ${i.location}`);
      if (i.risk_summary) L.push(`Risk: ${i.risk_summary}`);
      if (i.recommended_fix) L.push(`Recommended fix: ${i.recommended_fix}`);
      L.push(`Status: ${i.status}`);
      L.push("");
    }
  }

  if (model.retestItems.length) {
    L.push("RETEST CHECKLIST");
    for (const i of model.retestItems) L.push(`[ ] ${i.title} (${i.severity})`);
    L.push("");
  }

  L.push("SCORE INTERPRETATION");
  for (const b of SCORE_BANDS) L.push(`- ${b.range}: ${b.label}`);
  L.push("");

  L.push("FINAL NOTES");
  L.push(REPORT_DISCLAIMER);

  return L.join("\n");
}