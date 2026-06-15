// Shared status workflow + clipboard helpers for the Security Issues experience.
import { base44 } from "@/api/base44Client";
import { runRegistryScan, scoreLabel, SCAN_DISCLAIMER } from "@/components/admin/security/scanEngine";
import { autoEvaluateIssue, resolveRetestOutcome, buildRetestNote, appendNote } from "@/components/admin/security/retestEngine";

const OPEN_RETEST_STATUSES = ["Open", "In Progress", "Needs Retest"];

function rand() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// Create a SecurityCheck record documenting a retest outcome for an issue.
async function createRetestCheck({ issue, scanId, result, manual }) {
  const statusMap = { Passed: "Passed", Failed: "Failed", "Needs Manual Review": "Warning", Skipped: "Skipped" };
  await base44.entities.SecurityCheck.create({
    check_id: `chk_${rand()}`,
    scan_id: scanId,
    check_name: `Retest: ${issue.title || issue.category}`,
    category: issue.category || "General",
    status: statusMap[result] || "Skipped",
    result_summary: `${manual ? "Manual" : "Automatic"} retest result: ${result}.`,
    details: [issue.affected_route, issue.affected_entity, issue.affected_role].filter(Boolean).join(" · ") || undefined,
    severity_if_failed: issue.severity || "Medium",
    related_issue_id: issue.issue_id || issue.id,
  });
}

// Retest a single issue. `result` may be provided (manual confirmation) or
// left null to auto-evaluate against the registry. Persists a SecurityCheck,
// updates the issue status + notes, and returns the final result.
export async function retestIssue(issue, { result = null, scanId = null, registry = null, manual = false } = {}) {
  let finalResult = result;

  // Auto-evaluate when no manual result was supplied.
  if (!finalResult) {
    const reg = registry || (await base44.entities.SecurityRegistry.list("-created_date", 500));
    finalResult = autoEvaluateIssue(issue, reg).autoResult;
  }

  // Resolve / create the scan this retest belongs to.
  let targetScanId = scanId;
  if (!targetScanId) {
    const me = await base44.auth.me().catch(() => null);
    const scan = await base44.entities.SecurityScan.create({
      scan_id: `retest_${rand()}`,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      started_by: me?.email || "admin",
      status: "Completed",
      scan_type: "Retest",
      summary: `Single-issue retest: "${issue.title || issue.category}" → ${finalResult}.`,
    });
    targetScanId = scan.id;
  }

  await createRetestCheck({ issue, scanId: targetScanId, result: finalResult, manual });

  const patch = resolveRetestOutcome(issue, finalResult);
  const note = buildRetestNote(finalResult, { manual });
  patch.admin_notes = appendNote(issue.admin_notes, note);
  await base44.entities.SecurityIssue.update(issue.id, patch);

  return { result: finalResult, status: patch.status, scanId: targetScanId };
}

// Retest every Open / In Progress / Needs Retest issue under a new Retest scan,
// re-evaluating each against the registry and recomputing the security score.
export async function retestOpenIssues(allIssues) {
  const targets = allIssues.filter((i) => OPEN_RETEST_STATUSES.includes(i.status));
  const me = await base44.auth.me().catch(() => null);
  const registry = await base44.entities.SecurityRegistry.list("-created_date", 500);

  const scan = await base44.entities.SecurityScan.create({
    scan_id: `retest_${rand()}`,
    started_at: new Date().toISOString(),
    started_by: me?.email || "admin",
    status: "Running",
    scan_type: "Retest",
  });

  let passed = 0;
  let failed = 0;
  for (const issue of targets) {
    const res = await retestIssue(issue, { scanId: scan.id, registry });
    if (res.result === "Passed") passed += 1;
    else failed += 1;
  }

  // Recompute the security score from issues that remain unresolved.
  const fresh = await base44.entities.SecurityIssue.list("-created_date", 500);
  const stillOpen = fresh.filter((i) => OPEN_RETEST_STATUSES.includes(i.status));
  const { score, label } = runRegistryScan(registry);

  await base44.entities.SecurityScan.update(scan.id, {
    status: "Completed",
    completed_at: new Date().toISOString(),
    overall_score: score,
    critical_count: stillOpen.filter((i) => i.severity === "Critical").length,
    high_count: stillOpen.filter((i) => i.severity === "High").length,
    medium_count: stillOpen.filter((i) => i.severity === "Medium").length,
    low_count: stillOpen.filter((i) => i.severity === "Low").length,
    total_checks: targets.length,
    passed_checks: passed,
    failed_checks: failed,
    summary: `Retest of ${targets.length} open issue${targets.length === 1 ? "" : "s"}: ${passed} passed, ${failed} still failing. Score ${score}/100 (${label}). ${SCAN_DISCLAIMER}`,
  });

  return { tested: targets.length, passed, failed, score, label, scanId: scan.id };
}

export const STATUS_ACTIONS = [
  { status: "In Progress", label: "Mark In Progress" },
  { status: "Fixed", label: "Mark Fixed" },
  { status: "Needs Retest", label: "Mark Needs Retest" },
  { status: "Ignored", label: "Ignore" },
  { status: "False Positive", label: "Mark False Positive" },
];

// Update an issue's status, applying the resolved_at + false-positive rules.
export async function updateIssueStatus(issue, nextStatus, extra = {}) {
  const patch = { status: nextStatus, ...extra };
  if (nextStatus === "Fixed" && !issue.resolved_at) {
    patch.resolved_at = new Date().toISOString();
  }
  await base44.entities.SecurityIssue.update(issue.id, patch);
}

// Copy text to clipboard; returns true on success, false if it should fall back to a textarea.
export async function copyToClipboard(text) {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through
  }
  return false;
}