// Shared client-side helpers for the blog editor.

export function plainTextFromMarkdown(md) {
  return (md || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[(.*?)\]\(.*?\)/g, " ")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[#>*_~\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function countWords(md) {
  const t = plainTextFromMarkdown(md);
  return t ? t.split(" ").filter(Boolean).length : 0;
}

export function readingMinutes(md) {
  return Math.max(1, Math.round(countWords(md) / 200));
}

// Extract h1-h3 headings for a table-of-contents preview.
export function extractToc(md) {
  const toc = [];
  (md || "").split("\n").forEach((line) => {
    const m = line.match(/^(#{1,3})\s+(.*)/);
    if (m) toc.push({ level: m[1].length, text: m[2].trim() });
  });
  return toc;
}

export const POST_STATUSES = [
  "draft",
  "needs_review",
  "approved",
  "scheduled",
  "published",
  "archived",
];

export const POST_TYPES = [
  "blog_post", "guide", "tutorial", "case_study", "news",
  "comparison", "listicle", "announcement", "changelog", "pillar_page",
];

export const SEARCH_INTENTS = ["informational", "commercial", "transactional", "navigational", "local"];