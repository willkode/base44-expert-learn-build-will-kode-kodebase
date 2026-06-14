import { base44 } from "@/api/base44Client";

// A post is publicly visible only when it is genuinely published.
// (Kept for any legacy callers; the public read path now goes through the
// getPublicBlog backend function, which enforces this server-side.)
export function isPublishedPost(p) {
  if (!p) return false;
  if (p.status) return p.status === "published";
  return p.published === true;
}

// Fetch all publicly visible posts, newest first, via the secured public
// endpoint. The BlogPost entity is admin-read-only, so this function (service
// role) is the only way drafts/scheduled/etc. stay out of public reach.
export async function fetchPublishedPosts(limit = 500) {
  const res = await base44.functions.invoke("getPublicBlog", { mode: "list", limit });
  return res.data?.posts || [];
}

// Fetch a single published post by slug (returns null if not published).
export async function fetchPublishedPost(slug) {
  const res = await base44.functions.invoke("getPublicBlog", { mode: "post", slug });
  return { post: res.data?.post || null, settings: res.data?.settings || {} };
}

// Unique, sorted list of category labels present on published posts.
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