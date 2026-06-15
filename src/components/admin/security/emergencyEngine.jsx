// Security Lockdown Pro — Emergency Lockdown engine.
// Reuses the registry scan, then isolates the highest-risk findings and
// generates urgent, copy-ready emergency fix prompts. Does NOT change real
// route/entity protection — it guides the admin through urgent risks.

import { runRegistryScan } from "@/components/admin/security/scanEngine";

export const EMERGENCY_WARNING =
  "Emergency Lockdown Review helps identify and prioritize urgent risks. Review all recommended changes before applying fixes to a live production app.";

// Categories considered urgent for an emergency review.
const URGENT_CATEGORIES = [
  "Admin Lockdown",
  "Public Data Leak",
  "User Data Isolation",
  "Entity Exposure",
  "Dangerous Action",
];

// An issue is urgent if it is Critical/High, OR sits in an urgent category.
function isUrgent(issue) {
  if (issue.severity === "Critical" || issue.severity === "High") return true;
  return URGENT_CATEGORIES.includes(issue.category);
}

// Builds the exact emergency fix prompt template requested.
export function buildEmergencyFixPrompt(issue) {
  return [
    "Fix this urgent Base44 security issue immediately.",
    `Issue:\n${issue.title || "Untitled issue"}`,
    `Severity:\n${issue.severity}`,
    `Immediate Risk:\n${issue.risk_summary || issue.potential_impact || "Sensitive access may be exposed."}`,
    [
      "Emergency Fix Goal:",
      "Restrict access to the affected route/entity/action immediately while preserving public marketing pages and normal authenticated user access where safe.",
    ].join("\n"),
    [
      "Instructions:",
      "1. Do not redesign the app.",
      "2. Do not change unrelated features.",
      "3. Restrict this route/entity/action to the correct user role or owner.",
      "4. If unsure, temporarily restrict to admin-only until reviewed.",
      "5. Hide related navigation or buttons from unauthorized users.",
      "6. Add redirect or access denied behavior.",
      "7. Test as logged-out user, regular user, non-owner user, and admin.",
      "8. Return what was changed and what still needs review.",
    ].join("\n"),
    [
      "Return:",
      "- Immediate fix applied",
      "- Files/pages/entities changed",
      "- Tests performed",
      "- Remaining risks",
    ].join("\n"),
  ].join("\n\n");
}

// Runs the urgent-focused emergency review against the registry.
// Returns { checks, urgentIssues, score, label, summary }.
export function runEmergencyReview(registry) {
  const { checks, issues, score, label } = runRegistryScan(registry);

  // Keep only urgent issues, then sort Critical → High → rest.
  const order = { Critical: 0, High: 1, Medium: 2, Low: 3, Info: 4 };
  const urgentIssues = issues
    .filter(isUrgent)
    .map((i) => ({ ...i, fix_prompt: buildEmergencyFixPrompt(i) }))
    .sort((a, b) => (order[a.severity] ?? 5) - (order[b.severity] ?? 5));

  const routesToRestrict = [...new Set(urgentIssues.map((i) => i.affected_route).filter(Boolean))];
  const entitiesToReview = [...new Set(urgentIssues.map((i) => i.affected_entity).filter(Boolean))];
  const rolesToReview = [...new Set(urgentIssues.map((i) => i.affected_role).filter(Boolean))];

  const criticalCount = urgentIssues.filter((i) => i.severity === "Critical").length;
  const highCount = urgentIssues.filter((i) => i.severity === "High").length;

  // Recommended immediate actions, highest-leverage first.
  const immediateActions = [];
  if (criticalCount > 0) immediateActions.push(`Resolve ${criticalCount} critical risk${criticalCount === 1 ? "" : "s"} first — these may expose admin tools or private data.`);
  if (routesToRestrict.length > 0) immediateActions.push(`Restrict ${routesToRestrict.length} exposed route${routesToRestrict.length === 1 ? "" : "s"} to the correct role or owner.`);
  if (entitiesToReview.length > 0) immediateActions.push(`Tighten RLS on ${entitiesToReview.length} entit${entitiesToReview.length === 1 ? "y" : "ies"} holding sensitive or user-owned data.`);
  if (rolesToReview.length > 0) immediateActions.push(`Review ${rolesToReview.length} role${rolesToReview.length === 1 ? "" : "s"} for privilege escalation (user management, billing, security).`);
  if (immediateActions.length === 0) immediateActions.push("No urgent access-control risks were detected in the current registry. Continue with standard scans and manual testing.");

  const summary = {
    criticalCount,
    highCount,
    totalUrgent: urgentIssues.length,
    immediateActions,
    routesToRestrict,
    entitiesToReview,
    rolesToReview,
  };

  return { checks, urgentIssues, score, label, summary };
}