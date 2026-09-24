// Shared helpers for the Build Your Own library.

export const BUILD_PATH = "/learn/build-your-own";

export const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

export const guidePath = (t) => (t?.slug ? `${BUILD_PATH}/${t.slug}` : BUILD_PATH);

export function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

// Human-readable credit for the original guide, derived from its link.
export function sourceNameFromUrl(url = "") {
  let u;
  try { u = new URL(url); } catch { return ""; }
  const host = u.hostname.replace(/^www\./, "");
  const [owner] = u.pathname.split("/").filter(Boolean);
  if (host === "github.com" && owner) return `${owner} on GitHub`;
  if (host === "gist.github.com") return owner ? `${owner} on GitHub Gist` : "GitHub Gist";
  if (host.endsWith("github.io")) return host;
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be") return "YouTube";
  return host;
}

// YouTube watch/short/playlist links -> embeddable URL (null if not YouTube).
export function youtubeEmbedUrl(url = "") {
  let u;
  try { u = new URL(url); } catch { return null; }
  const host = u.hostname.replace(/^(www|m)\./, "");
  if (host !== "youtube.com" && host !== "youtu.be") return null;
  const list = u.searchParams.get("list");
  let id = host === "youtu.be" ? u.pathname.slice(1) : u.searchParams.get("v");
  if (!id) {
    const m = u.pathname.match(/\/(?:embed|shorts|live)\/([\w-]{11})/);
    if (m) id = m[1];
  }
  if (id) return `https://www.youtube-nocookie.com/embed/${id}${list ? `?list=${list}` : ""}`;
  if (list) return `https://www.youtube-nocookie.com/embed/videoseries?list=${list}`;
  return null;
}
