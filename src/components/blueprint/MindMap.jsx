import React, { useMemo } from "react";
import { Database, FileText, Shield, Server, Plug, Box } from "lucide-react";

// Pull bullet/line-style items out of a blueprint markdown text field.
function extractItems(text, max = 6) {
  if (!text) return [];
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const items = [];
  for (const line of lines) {
    // Match list bullets, numbered items, or bold headers
    const m = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/) || line.match(/^\*\*(.+?)\*\*/);
    if (m) {
      let label = (m[1] || "").replace(/\*\*/g, "").replace(/`/g, "").trim();
      // Take the part before a colon/dash description
      label = label.split(/[:–—-]/)[0].trim();
      if (label && label.length <= 40 && !items.includes(label)) items.push(label);
    }
    if (items.length >= max) break;
  }
  return items;
}

const BRANCHES = [
  { key: "entityPlan", label: "Entities", icon: Database, color: "text-chart-2", ring: "border-chart-2/40" },
  { key: "pagePlan", label: "Pages", icon: FileText, color: "text-primary", ring: "border-primary/40" },
  { key: "rolePermissionPlan", label: "Roles", icon: Shield, color: "text-chart-4", ring: "border-chart-4/40" },
  { key: "backendFunctionPlan", label: "Backend", icon: Server, color: "text-chart-2", ring: "border-chart-2/40" },
  { key: "integrationPlan", label: "Integrations", icon: Plug, color: "text-chart-5", ring: "border-chart-5/40" },
  { key: "workflowPlan", label: "Workflows", icon: Box, color: "text-primary", ring: "border-primary/40" },
];

function Branch({ label, icon: Icon, color, ring, items }) {
  return (
    <div className={`rounded-2xl border ${ring} bg-card/60 p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`flex items-center justify-center w-8 h-8 rounded-lg bg-secondary/60 ${color}`}>
          <Icon className="w-4 h-4" />
        </span>
        <span className="font-sora font-semibold text-sm">{label}</span>
        <span className="ml-auto text-xs text-muted-foreground">{items.length}</span>
      </div>
      <div className="space-y-1.5">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No items detected</p>
        ) : (
          items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-foreground/90">
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50 shrink-0" />
              <span className="truncate">{item}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function MindMap({ project, blueprint }) {
  const branches = useMemo(
    () => BRANCHES.map((b) => ({ ...b, items: extractItems(blueprint?.[b.key]) })),
    [blueprint]
  );

  return (
    <div className="rounded-2xl border border-border bg-card/40 p-5 blueprint-grid">
      <div className="flex justify-center mb-6">
        <div className="text-center px-6 py-4 rounded-2xl bg-primary text-primary-foreground glow-orange max-w-xs">
          <p className="text-[10px] uppercase tracking-widest opacity-80">App</p>
          <p className="font-sora font-bold text-lg leading-tight truncate">{project.projectName}</p>
          {project.appType && <p className="text-xs opacity-80 mt-0.5 truncate">{project.appType}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((b) => (
          <Branch key={b.key} {...b} />
        ))}
      </div>
    </div>
  );
}