import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered, Link2, Code, Quote,
} from "lucide-react";

const TOOLS = [
  { icon: Heading2, label: "H2", wrap: ["## ", ""], block: true },
  { icon: Heading3, label: "H3", wrap: ["### ", ""], block: true },
  { icon: Bold, label: "Bold", wrap: ["**", "**"] },
  { icon: Italic, label: "Italic", wrap: ["*", "*"] },
  { icon: List, label: "Bullets", wrap: ["- ", ""], block: true },
  { icon: ListOrdered, label: "Numbered", wrap: ["1. ", ""], block: true },
  { icon: Quote, label: "Quote", wrap: ["> ", ""], block: true },
  { icon: Code, label: "Code", wrap: ["`", "`"] },
  { icon: Link2, label: "Link", wrap: ["[", "](https://)"] },
];

export default function MarkdownEditor({ value, onChange }) {
  const ref = React.useRef(null);

  const apply = (wrap, block) => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = value || "";
    const selected = text.slice(start, end);
    const [before, after] = wrap;
    const insert = block ? `${before}${selected || "Text"}` : `${before}${selected || "text"}${after}`;
    const next = text.slice(0, start) + insert + text.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = start + before.length;
      ta.selectionEnd = start + before.length + (selected || "text").length;
    });
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-secondary/40 px-2 py-1">
        {TOOLS.map((t) => (
          <Button
            key={t.label}
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title={t.label}
            onClick={() => apply(t.wrap, t.block)}
          >
            <t.icon className="w-4 h-4" />
          </Button>
        ))}
      </div>
      <Textarea
        ref={ref}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your article in markdown..."
        className="min-h-[420px] rounded-none border-0 font-mono text-sm leading-6 focus-visible:ring-0"
      />
    </div>
  );
}