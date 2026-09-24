import { base44 } from "@/api/base44Client";

const VIEWED_KEY = "kb_prompt_viewed";

// Fire-and-forget — tracking must never break the page.
function safeInvoke(payload) {
  try {
    base44.functions.invoke("trackPromptEvent", payload).catch(() => {});
  } catch {
    /* ignore */
  }
}

// Counts at most one view per prompt per browser session.
export function trackPromptView(slug) {
  if (!slug) return;
  try {
    const seen = JSON.parse(sessionStorage.getItem(VIEWED_KEY) || "[]");
    if (seen.includes(slug)) return;
    sessionStorage.setItem(VIEWED_KEY, JSON.stringify([...seen, slug]));
  } catch {
    /* storage unavailable — still count */
  }
  safeInvoke({ slug, event: "view" });
}

export function trackPromptCopy(slug) {
  if (!slug) return;
  safeInvoke({ slug, event: "copy" });
}
