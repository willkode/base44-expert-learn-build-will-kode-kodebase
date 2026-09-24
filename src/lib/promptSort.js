import { base44 } from "@/api/base44Client";

// Shared ordering for LibraryPrompt everywhere it's shown publicly:
// featured first, then newest published (publishedAt, falling back to created_date).

export const publishedTime = (p) => new Date(p.publishedAt || p.created_date || 0).getTime();

export const byNewest = (a, b) => publishedTime(b) - publishedTime(a);

export const byFeaturedThenNewest = (a, b) =>
  (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || byNewest(a, b);

// Loads the library and returns it featured-first/newest. Sorting happens
// client-side because publishedAt can differ from created_date.
export async function fetchLibraryPrompts(limit) {
  const data = await base44.entities.LibraryPrompt.list("-created_date", 1000);
  const sorted = [...(data || [])].sort(byFeaturedThenNewest);
  return limit ? sorted.slice(0, limit) : sorted;
}
