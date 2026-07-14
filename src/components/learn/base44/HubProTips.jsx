import React from "react";
import { Lightbulb } from "lucide-react";

const TIP_REGEX = /\b(never|always|must|avoid|don'?t|do not|critical|gotcha|warning|careful|only use|prefer|instead of|breaks?|fails?|required)\b/i;

// Pulls the most actionable rules/gotchas out of a topic's markdown body
export function extractProTips(body, max = 6) {
  const tips = [];
  let inCode = false;
  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (line.startsWith("```")) {
      inCode = !inCode;
      continue;
    }
    if (inCode || line.startsWith("|") || line.startsWith("#")) continue;
    const isBullet = /^([-*]|\d+\.)\s+/.test(line);
    if (!isBullet) continue;
    const text = line
      .replace(/^([-*]|\d+\.)\s+/, "")
      .replace(/\*\*/g, "")
      .replace(/`/g, "")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .trim();
    if (text.length < 25 || text.length > 220) continue;
    if (TIP_REGEX.test(text)) tips.push(text);
    if (tips.length >= max) break;
  }
  return tips;
}

export default function HubProTips({ body }) {
  const tips = extractProTips(body);
  if (tips.length === 0) return null;
  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-5 mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Lightbulb className="w-4 h-4" />
        </span>
        <p className="font-sora font-bold text-sm uppercase tracking-wider text-gradient-orange">Pro Tips</p>
      </div>
      <ul className="space-y-2">
        {tips.map((tip, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm leading-6 text-foreground/85">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#f87171] to-[#fb923c] shrink-0" />
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}