import { useEffect, useRef } from "react";
import { trackBlogScroll } from "@/lib/blogTracking";

const THRESHOLDS = [25, 50, 75, 100];

// Tracks scroll-depth thresholds (25/50/75/100%) and reports time-on-page
// when the visitor leaves. Active only when `enabled` (published post + slug).
export default function useBlogScrollTracking(slug, enabled) {
  const fired = useRef(new Set());
  const startedAt = useRef(Date.now());
  const lastDepth = useRef(0);

  useEffect(() => {
    if (!enabled || !slug) return;
    fired.current = new Set();
    startedAt.current = Date.now();
    lastDepth.current = 0;

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 100;
      for (const t of THRESHOLDS) {
        if (pct >= t && !fired.current.has(t)) {
          fired.current.add(t);
          lastDepth.current = t;
          trackBlogScroll(slug, t);
        }
      }
    };

    const report = () => {
      const seconds = Math.round((Date.now() - startedAt.current) / 1000);
      if (seconds > 2) trackBlogScroll(slug, lastDepth.current || 0, seconds);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") report();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", report);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", report);
    };
  }, [slug, enabled]);
}