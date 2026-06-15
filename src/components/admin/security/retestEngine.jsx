// Security Lockdown Pro — retest engine.
// Re-evaluates a single issue against the current registry, and builds
// category-based manual retest checklists. Pure logic — no DB calls.
import { runRegistryScan } from "@/components/admin/security/scanEngine";

export const RETEST_RESULTS = ["Passed", "Failed", "Needs Manual Review", "Skipped"];

// Category-based manual retest checklists.
const ROUTE_CHECKLIST = [
  "Test the route as a logged-out user.",
  "Test the route as a regular user.",
  "Test the route as an admin.",
  "Test direct URL access (paste the URL into the browser).",
  "Test navigation visibility (link hidden from users who shouldn't see it).",
];

const ENTITY_CHECKLIST = [
  "Test as a logged-out user.",
  "Test as the owner user.",
  "Test as a second, non-owner user.",
  "Test as an admin.",
  "Verify read / write / delete restrictions are enforced.",
];

const ADMIN_CHECKLIST = [
  "Test the admin route as a regular user (should be blocked).",
  "Test the admin route as an admin (should load).",
  "Verify admin navigation is hidden from non-admins.",
  "Verify direct URL access is blocked for non-admins.",
];

const PREMIUM_CHECKLIST = [
  "Test as a free user (should be locked).",
  "Test as a paid user (should have access).",
  "Test as an admin.",
  "Verify the restricted feature is locked for non-paying users.",
];

const GENERIC_CHECKLIST = [
  "Test as a logged-out user.",
  "Test as a regular authenticated user.",
  "Test as an admin.",
  "Verify the issue can no longer be reproduced.",
];

// Pick the right checklist for an issue based on its category.
export function getRetestChecklist(issue) {
  const cat = issue?.category || "";
  if (cat === "Admin Lockdown") return ADMIN_CHECKLIST;
  if (cat === "Route Protection") return ROUTE_CHECKLIST;
  if (cat === "Premium Access") return PREMIUM_CHECKLIST;
  if (["Entity Exposure", "Public Data Leak", "User Data Isolation"].includes(cat)) return ENTITY_CHECKLIST;
  if (["Role-Based Access", "Dangerous Action"].includes(cat)) return ENTITY_CHECKLIST;
  return GENERIC_CHECKLIST;
}

// True when an issue's category can be re-evaluated automatically from the registry.
export function isAutoRetestable(issue) {
  return Boolean(issue?.affected_route || issue?.affected_entity || issue?.affected_role);
}

// Match a freshly-scanned issue to an existing one by category + scope + title.
function sameIssue(a, b) {
  return (
    a.category === b.category &&
    (a.affected_route || "") === (b.affected_route || "") &&
    (a.affected_entity || "") === (b.affected_entity || "") &&
    (a.affected_role || "") === (b.affected_role || "") &&
    (a.title || "") === (b.title || "")
  );
}

// Re-run the registry scan and decide whether `issue` still exists.
// Returns { autoResult: "Passed"|"Failed"|null, stillPresent, freshIssues }.
export function autoEvaluateIssue(issue, registry) {
  const { issues: freshIssues } = runRegistryScan(registry);
  const stillPresent = freshIssues.some((f) => sameIssue(f, issue));
  return {
    autoResult: stillPresent ? "Failed" : "Passed",
    stillPresent,
    freshIssues,
  };
}

// Build a timestamped retest note line.
export function buildRetestNote(result, { manual = false, detail = "" } = {}) {
  const when = new Date().toLocaleString();
  const how = manual ? "manual" : "automatic";
  const base = `[Retest ${when}] ${how} result: ${result}.`;
  return detail ? `${base} ${detail}` : base;
}

// Append a note to an issue's existing admin_notes.
export function appendNote(existing, note) {
  return existing ? `${existing}\n${note}` : note;
}

// Map a retest result to the resulting issue status + patch.
// Returns { status, patch } where patch is applied on top of the status.
export function resolveRetestOutcome(issue, result) {
  const patch = {};
  if (result === "Passed") {
    patch.status = "Fixed";
    if (!issue.resolved_at) patch.resolved_at = new Date().toISOString();
  } else if (result === "Failed") {
    // Keep it actionable — Open or Needs Retest, fix prompt stays available.
    patch.status = issue.status === "Needs Retest" ? "Needs Retest" : "Open";
  } else if (result === "Needs Manual Review") {
    patch.status = "Needs Retest";
  } else {
    // Skipped — leave status untouched.
    patch.status = issue.status;
  }
  return patch;
}