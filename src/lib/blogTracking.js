import { base44 } from "@/api/base44Client";
import { trackEvent } from "@/lib/analytics";

const VISITOR_KEY = "kb_blog_visitor";

// Stable, anonymous, client-generated visitor id (no PII). Used only for
// approximate unique-visitor counting; hashed again server-side.
export function getVisitorId() {
  if (typeof window === "undefined") return null;
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

// Fire-and-forget — tracking must never break the page.
function safeInvoke(fn, payload) {
  try {
    base44.functions.invoke(fn, payload).catch(() => {});
  } catch {
    /* ignore */
  }
}

export function trackBlogView(slug) {
  if (!slug) return;
  safeInvoke("trackBlogPostView", {
    slug,
    visitorId: getVisitorId(),
    referrer: typeof document !== "undefined" ? document.referrer : "",
  });
  trackEvent("blog_post_view", { slug });
}

export function trackBlogClick(slug, clickType) {
  if (!slug) return;
  safeInvoke("trackBlogPostClick", { slug, clickType });
  trackEvent("blog_post_click", { slug, click_type: clickType });
}

export function trackBlogScroll(slug, depth, seconds) {
  if (!slug) return;
  safeInvoke("trackBlogScrollDepth", { slug, depth, seconds });
  trackEvent("blog_scroll_depth", { slug, depth });
}