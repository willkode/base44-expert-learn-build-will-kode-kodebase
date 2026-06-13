import { useEffect, useState } from "react";
import { SITE, canonical } from "@/lib/seo";
import { getOverride } from "@/lib/seoOverrides";

// Lightweight head manager — no external deps. Sets title, meta, canonical,
// OG/Twitter tags, and JSON-LD on mount, and restores nothing (SPA pages overwrite each other).
function setMeta(attr, key, content) {
  if (content == null) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export default function Seo({
  title: titleProp,
  description: descriptionProp = SITE.description,
  path = "/",
  type = "website",
  image: imageProp = SITE.ogImage,
  noindex: noindexProp = false,
  jsonLd = [],
}) {
  // Admin-defined per-page override (loaded once, cached). Falls back to props.
  const [override, setOverride] = useState(null);
  useEffect(() => {
    let active = true;
    getOverride(path).then((o) => { if (active) setOverride(o); });
    return () => { active = false; };
  }, [path]);

  const title = override?.title || titleProp;
  const description = override?.description || descriptionProp;
  const image = override?.ogImage || imageProp;
  const noindex = override?.noindex ?? noindexProp;

  useEffect(() => {
    const fullTitle = title ? `${title}` : SITE.name;
    const url = canonical(path);
    document.title = fullTitle;

    setMeta("name", "description", description);
    setMeta("name", "viewport", "width=device-width, initial-scale=1");
    setMeta(
      "name",
      "robots",
      noindex ? "noindex, nofollow" : "index, follow"
    );
    setLink("canonical", url);

    // Open Graph
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:site_name", SITE.name);
    setMeta("property", "og:type", type);
    setMeta("property", "og:image", image);
    setMeta("property", "og:image:width", "1200");
    setMeta("property", "og:image:height", "630");

    // Twitter
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image);
    setMeta("name", "twitter:site", SITE.twitter);

    // JSON-LD structured data
    const scripts = [];
    const blocks = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
    blocks.filter(Boolean).forEach((data) => {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.setAttribute("data-seo", "true");
      s.textContent = JSON.stringify(data);
      document.head.appendChild(s);
      scripts.push(s);
    });

    return () => {
      scripts.forEach((s) => s.remove());
    };
  }, [title, description, path, type, image, noindex, JSON.stringify(jsonLd)]);

  return null;
}