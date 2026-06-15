// Shared status workflow + clipboard helpers for the Security Issues experience.
import { base44 } from "@/api/base44Client";

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