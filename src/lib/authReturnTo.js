// Keep authentication return targets on this app and preserve purchase context.
// URLSearchParams already decodes query values; do not decode them a second time.
export function safeReturnTo(search = window.location.search, origin = window.location.origin, fallback = "/start") {
  const params = new URLSearchParams(search);
  const raw = params.get("next") || params.get("returnTo");
  if (!raw) return fallback;
  try {
    const url = new URL(raw, origin);
    if (url.origin !== origin) return fallback;
    // These bootstrap parameters can overwrite the session or backend at next load.
    for (const p of ["access_token", "clear_access_token", "app_id", "app_base_url", "functions_version", "from_url"]) {
      url.searchParams.delete(p);
    }
    const path = url.pathname + url.search + url.hash;
    if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return fallback;
    // Avoid returning to authentication itself and trapping the buyer in a loop.
    if (["/login", "/register", "/forgot-password", "/reset-password"].includes(url.pathname.replace(/\/$/, ""))) return fallback;
    return path;
  } catch {
    return fallback;
  }
}
