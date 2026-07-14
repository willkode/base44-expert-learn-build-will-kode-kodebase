export const DOC_URL =
  "https://media.base44.com/files/public/6a1905a0bc76553d6c934574/e8a12a662_base44.md";

// Category assignment per numbered section in the knowledge base doc
const CATEGORY_MAP = {
  "Getting Started": [1, 2, 3, 40],
  "Frontend & UI": [4, 15, 16, 17, 35],
  "Backend & Functions": [5, 9, 25, 26, 27, 29, 38],
  "Data & Entities": [6, 21, 28, 33],
  "Auth & Users": [7, 22],
  "AI, Agents & Skills": [8, 11, 31, 32, 42],
  "Automation & Connectors": [10, 12, 30],
  "Payments & Analytics": [13, 14],
  "Deployment & GitHub": [18, 19],
  "Best Practices": [20, 23, 24, 34, 36, 37, 39, 41],
};

export const CATEGORY_ORDER = Object.keys(CATEGORY_MAP);

export function categoryForSection(num) {
  for (const [cat, nums] of Object.entries(CATEGORY_MAP)) {
    if (nums.includes(num)) return cat;
  }
  return "Reference";
}

export function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}