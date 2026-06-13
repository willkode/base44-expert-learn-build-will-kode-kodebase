// Loads admin-defined per-page SEO overrides once and caches them in memory.
// The Seo component calls getOverride(path) to merge any active override on top
// of the page's hardcoded defaults. Read access is public so overrides apply
// to anonymous visitors too.
import { base44 } from "@/api/base44Client";

let cache = null;
let loadingPromise = null;

function load() {
  if (cache) return Promise.resolve(cache);
  if (loadingPromise) return loadingPromise;
  loadingPromise = base44.entities.SeoSetting
    .filter({ enabled: true })
    .then((rows) => {
      cache = {};
      rows.forEach((r) => { if (r.path) cache[r.path] = r; });
      return cache;
    })
    .catch(() => {
      cache = {};
      return cache;
    });
  return loadingPromise;
}

// Returns a promise resolving to the override object for a path, or null.
export async function getOverride(path) {
  const map = await load();
  return map[path] || null;
}

// Clears the cache so the next read re-fetches (call after admin saves).
export function clearOverrideCache() {
  cache = null;
  loadingPromise = null;
}