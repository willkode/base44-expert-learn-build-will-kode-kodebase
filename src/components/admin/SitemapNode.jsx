import React, { useState } from "react";
import { ChevronRight, ExternalLink, Copy } from "lucide-react";
import { typeStyles } from "@/lib/sitemapData";

export default function SitemapNode({ node, depth = 0 }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSection = node.type === "layout";
  const style = typeStyles[node.type] || typeStyles.public;

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-2 rounded-lg border ${isSection ? style.border + " " + style.bg + " border-dashed" : style.border + " " + style.bg} px-3 py-2 transition-colors hover:border-primary/40`}
        style={{ marginLeft: `${depth * 24}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>
        ) : (
          <div className="w-4 shrink-0" />
        )}

        <div className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />

        <span className={`text-sm ${isSection ? "font-sora font-bold text-foreground" : "font-medium text-foreground/90"} truncate`}>
          {node.label}
        </span>

        {node.path && (
          <code className="text-xs text-muted-foreground bg-secondary/60 px-1.5 py-0.5 rounded font-mono hidden sm:inline-block">
            {node.path}
          </code>
        )}

        <div className="flex items-center gap-1.5 ml-auto">
          {node.type !== "layout" && (
            <span className={`text-[10px] font-semibold uppercase tracking-wide ${style.color} hidden md:inline`}>
              {style.label}
            </span>
          )}
          {node.path && node.path !== "*" && (
            <button
              onClick={() => navigator.clipboard?.writeText(node.path)}
              className="text-muted-foreground hover:text-primary transition-colors p-0.5"
              title="Copy path"
            >
              <Copy className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="mt-1 space-y-1">
          {node.children.map((child, idx) => (
            <SitemapNode key={idx} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}