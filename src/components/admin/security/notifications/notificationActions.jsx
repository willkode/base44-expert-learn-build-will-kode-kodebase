// Security Lockdown Pro — in-app notification generation.
// Self-contained: writes SecurityNotification records that surface in the dashboard bell + banners.
// Respects the SecuritySetting toggles; never sends external email.
import { base44 } from "@/api/base44Client";

// Resolve which toggles are on. Defaults to enabled when no setting record exists.
function flags(setting) {
  return {
    notifyCritical: setting?.critical_alert_enabled ?? true,
    notifyHigh: setting?.high_alert_enabled ?? true,
    notifyScanComplete: setting?.notify_on_scan_complete ?? true,
    notifyScanFailed: setting?.notify_on_scan_failure ?? true,
    notifyFixed: setting?.notify_on_issue_fixed ?? true,
  };
}

async function createNotifications(records) {
  if (!records.length) return;
  if (records.length === 1) {
    await base44.entities.SecurityNotification.create(records[0]);
  } else {
    await base44.entities.SecurityNotification.bulkCreate(records);
  }
}

// Fired when a scan begins.
export async function notifyScanStarted(scan, scanType = "Manual") {
  await createNotifications([{
    type: "scan_started",
    severity: "Info",
    title: "Security Scan Started",
    message: `A ${scanType.toLowerCase()} security scan is running across your app's routes, entities, and roles.`,
    scan_id: scan?.id,
  }]);
}

// Fired when a scan completes. Emits scan-complete + critical/high + score-threshold notifications.
export async function notifyScanCompleted({ scan, score, counts, label, setting }) {
  const f = flags(setting);
  const records = [];

  if (f.notifyScanComplete) {
    records.push({
      type: "scan_completed",
      severity: score < 40 ? "Critical" : score < 60 ? "High" : "Info",
      title: "Security Scan Complete",
      message: `Security scan completed with ${counts.critical} critical, ${counts.high} high, ${counts.medium} medium, and ${counts.low} low issues. Security Score: ${Math.round(score)}/100${label ? ` (${label})` : ""}.`,
      scan_id: scan?.id,
    });
  }

  if (f.notifyCritical && counts.critical > 0) {
    records.push({
      type: "critical_issue",
      severity: "Critical",
      title: "Critical Security Issue Found",
      message: `Security Lockdown detected ${counts.critical} critical issue${counts.critical === 1 ? "" : "s"}. Review the issues and copy the AI fix prompt from the Security Dashboard.`,
      scan_id: scan?.id,
    });
  }

  if (f.notifyHigh && counts.high > 0) {
    records.push({
      type: "high_issue",
      severity: "High",
      title: "High Security Issue Found",
      message: `Security Lockdown detected ${counts.high} high-severity issue${counts.high === 1 ? "" : "s"}. Review the issues and copy the AI fix prompt from the Security Dashboard.`,
      scan_id: scan?.id,
    });
  }

  if (score < 40) {
    records.push({
      type: "score_below_40",
      severity: "Critical",
      title: "Security Score Critically Low",
      message: `Your security score dropped to ${Math.round(score)}/100. This is a critical risk — address critical and high issues immediately.`,
      scan_id: scan?.id,
    });
  } else if (score < 60) {
    records.push({
      type: "score_below_60",
      severity: "High",
      title: "Security Score Below 60",
      message: `Your security score is ${Math.round(score)}/100. Review open issues to improve your security posture before launch.`,
      scan_id: scan?.id,
    });
  }

  await createNotifications(records);
}

// Fired when a scan fails.
export async function notifyScanFailed({ scan, error, setting }) {
  if (!flags(setting).notifyScanFailed) return;
  await createNotifications([{
    type: "scan_failed",
    severity: "High",
    title: "Security Scan Failed",
    message: `A security scan failed to complete${error ? `: ${error}` : "."} Try running the scan again from the Security Dashboard.`,
    scan_id: scan?.id,
  }]);
}

// Fired when an issue is marked Fixed.
export async function notifyIssueFixed({ issue, setting }) {
  if (!flags(setting).notifyFixed) return;
  await createNotifications([{
    type: "issue_fixed",
    severity: "Info",
    title: "Security Issue Marked Fixed",
    message: `"${issue.title || "An issue"}" was marked as fixed${issue.affected_route ? ` (${issue.affected_route})` : ""}. Run a retest to confirm the fix.`,
    scan_id: issue.scan_id,
    issue_id: issue.id,
  }]);
}

// Fired when an issue is set to Needs Retest.
export async function notifyIssueNeedsRetest({ issue }) {
  await createNotifications([{
    type: "issue_needs_retest",
    severity: "Medium",
    title: "Issue Needs Retest",
    message: `"${issue.title || "An issue"}" was marked as needing a retest${issue.affected_route ? ` (${issue.affected_route})` : ""}. Verify the fix using the retest checklist.`,
    scan_id: issue.scan_id,
    issue_id: issue.id,
  }]);
}