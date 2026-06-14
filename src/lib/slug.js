// Shared slug helpers for the blog. Keep in sync with functions/generateBlogSlug.js.
export const MAX_SLUG_LENGTH = 60;

// Lowercase, hyphenate, strip unsafe characters, collapse repeats, trim length.
export function slugify(input, maxLength = MAX_SLUG_LENGTH) {
  let s = (input || "")
    .toString()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")     // unsafe -> hyphen
    .replace(/-+/g, "-")             // collapse hyphens
    .replace(/^-|-$/g, "");          // trim edges
  if (s.length > maxLength) {
    s = s.slice(0, maxLength).replace(/-+$/g, "");
  }
  return s;
}

// Client-side validation mirror of validateBlogSlug.
export function checkSlug(slug) {
  const errors = [];
  if (!slug || !slug.trim()) {
    errors.push("Slug is required.");
    return { valid: false, errors };
  }
  if (slug !== slug.toLowerCase()) errors.push("Slug must be lowercase.");
  if (/\s/.test(slug)) errors.push("Slug cannot contain spaces.");
  if (!/^[a-z0-9-]+$/.test(slug)) errors.push("Slug can only contain letters, numbers, and hyphens.");
  if (/^-|-$/.test(slug)) errors.push("Slug cannot start or end with a hyphen.");
  if (slug.length > MAX_SLUG_LENGTH) errors.push(`Slug should be ${MAX_SLUG_LENGTH} characters or fewer.`);
  return { valid: errors.length === 0, errors };
}