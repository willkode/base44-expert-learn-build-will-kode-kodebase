import { useEffect, useState } from "react";
import { DOC_URL, categoryForSection, slugify } from "./base44HubData";
import { EXTRA_SECTIONS } from "./extraSections";

let cache = null;

function parseSections(md) {
  const chunks = md.split(/\n(?=## )/);
  const sections = [];
  for (const chunk of chunks) {
    const match = chunk.match(/^## (.+)\n/);
    if (!match) continue;
    const rawTitle = match[1].trim();
    if (/table of contents|supplementary documentation/i.test(rawTitle)) continue;
    const numMatch = rawTitle.match(/^(\d+)\.\s+(.*)$/);
    const num = numMatch ? parseInt(numMatch[1], 10) : null;
    const title = numMatch ? numMatch[2].trim() : rawTitle;
    let body = chunk.slice(match[0].length).trim();
    // Strip trailing horizontal rules
    body = body.replace(/\n---\s*$/g, "").trim();
    if (!body) continue;
    sections.push({
      num,
      title,
      slug: slugify(title),
      category: num ? categoryForSection(num) : "Reference",
      body,
    });
  }
  return sections.sort((a, b) => (a.num || 999) - (b.num || 999));
}

export default function useBase44Docs() {
  const [sections, setSections] = useState(cache);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cache) return;
    fetch(DOC_URL)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load the knowledge base");
        return r.text();
      })
      .then((md) => {
        cache = [...parseSections(md), ...EXTRA_SECTIONS];
        setSections(cache);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { sections: sections || [], loading, error };
}