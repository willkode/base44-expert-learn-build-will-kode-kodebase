import {
  Type, FileText, Plus, Maximize2, HelpCircle, Megaphone, Link2,
  Image, Sparkles, BookOpen, Target, Merge, Split, RefreshCw, Wrench,
} from "lucide-react";

// Maps recommendation types to a friendly label + icon. Keys match the
// BlogContentRefreshRecommendation.recommendationType enum (plus AI-only types).
export const REC_TYPE_META = {
  update_title: { label: "Update title", icon: Type },
  update_meta: { label: "Improve meta description", icon: FileText },
  add_section: { label: "Add new section", icon: Plus },
  expand_content: { label: "Expand content", icon: Maximize2 },
  add_faq: { label: "Add FAQ", icon: HelpCircle },
  improve_cta: { label: "Add / improve CTA", icon: Megaphone },
  add_internal_links: { label: "Add internal links", icon: Link2 },
  update_featured_image: { label: "Update featured image", icon: Image },
  improve_intro: { label: "Refresh intro", icon: Sparkles },
  improve_readability: { label: "Improve readability", icon: BookOpen },
  target_keyword: { label: "Target new keyword", icon: Target },
  consolidate: { label: "Consolidate posts", icon: Merge },
  split: { label: "Split into posts", icon: Split },
  refresh_stats: { label: "Refresh stats & dates", icon: RefreshCw },
  fix_decay: { label: "Fix traffic decay", icon: Wrench },
};

export function recTypeMeta(type) {
  return REC_TYPE_META[type] || { label: (type || "Update").replace(/_/g, " "), icon: Wrench };
}

export const PRIORITY_VARIANT = { high: "destructive", medium: "secondary", low: "outline" };

// Recommendation types the AI apply flow can handle automatically.
export const AI_APPLICABLE = new Set([
  "update_title", "update_meta", "improve_intro", "add_section", "expand_content",
  "improve_cta", "add_cta", "add_internal_links", "refresh_stats", "improve_readability", "fix_decay",
]);

export const STATUS_FILTERS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "applied", label: "Applied" },
  { value: "dismissed", label: "Dismissed" },
  { value: "all", label: "All" },
];