import { base44 } from "@/api/base44Client";

// A post is publicly visible only when it is genuinely published.
// Drafts, scheduled, needs_review, approved, rejected, archived, failed, and
// publishing posts must NEVER be exposed publicly. Legacy posts may have no
// `status` but the boolean `published` flag set.
export function isPublishedPost(p) {
  if (!p) return false;
  if (p.status) return p.status === "published";
  return p.published === true;
}

// Fetch all publicly visible posts, newest first. We pull a generous page and
// filter client-side so legacy (status-less) and new posts both work.
export async function fetchPublishedPosts(limit = 500) {
  const posts = await base44.entities.BlogPost.list("-publishedAt", limit);
  return posts.filter(isPublishedPost).sort((a, b) => {
    const da = new Date(a.publishedAt || a.created_date || 0).getTime();
    const db = new Date(b.publishedAt || b.created_date || 0).getTime();
    return db - da;
  });
}

// Unique, sorted list of category labels present on published posts.
// Supports both the legacy free-text `category` field and linked categories.
export function collectCategories(posts) {
  const set = new Set();
  posts.forEach((p) => {
    if (p.category) set.add(p.category);
  });
  return Array.from(set).sort();
}

// Unique, sorted list of tag labels present on published posts.
export function collectTags(posts) {
  const set = new Set();
  posts.forEach((p) => {
    (p.tags || []).forEach((t) => t && set.add(t));
  });
  return Array.from(set).sort();
}