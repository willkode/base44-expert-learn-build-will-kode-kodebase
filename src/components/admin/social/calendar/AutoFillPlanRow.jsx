import React from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PLATFORM_MAP } from "@/components/admin/social/socialConfig";

// One editable post in the generated plan preview.
export default function AutoFillPlanRow({ item, onChange, onRemove }) {
  const meta = PLATFORM_MAP[item.platform];
  const Icon = meta?.icon;
  const isReddit = item.platform === "reddit";
  const set = (field, value) => onChange({ ...item, [field]: value });

  // Datetime-local value from ISO.
  const dtValue = item.scheduled_at ? new Date(item.scheduled_at).toISOString().slice(0, 16) : "";

  return (
    <div className="rounded-xl border border-border bg-background/40 p-3.5 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon className="w-4 h-4 text-primary shrink-0" />}
          <span className="text-xs font-medium text-muted-foreground">{meta?.label || item.platform}</span>
          <span className="text-[11px] text-muted-foreground/70 truncate">· {item.mix_label}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={onRemove}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      <Input value={item.title_internal} onChange={(e) => set("title_internal", e.target.value)} placeholder="Internal title" className="h-8 text-sm" />

      {isReddit && (
        <Input value={item.reddit_title} onChange={(e) => set("reddit_title", e.target.value)} placeholder="Reddit title" className="h-8 text-sm" />
      )}

      <Textarea
        rows={3}
        value={isReddit ? item.reddit_body : item.content}
        onChange={(e) => set(isReddit ? "reddit_body" : "content", e.target.value)}
        placeholder="Post copy"
        className="text-sm"
      />

      {item.media_plan && (
        <p className="text-[11px] text-muted-foreground"><span className="font-medium">Media plan:</span> {item.media_plan}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="datetime-local"
          value={dtValue}
          onChange={(e) => set("scheduled_at", e.target.value ? new Date(e.target.value).toISOString() : null)}
          className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
        />
        {item.hashtags?.length > 0 && (
          <span className="text-[11px] text-muted-foreground truncate">{item.hashtags.slice(0, 4).map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")}</span>
        )}
      </div>

      {item.warnings?.map((w, i) => (
        <div key={i} className="flex items-start gap-1.5 text-[11px] text-amber-400">
          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" /> {w}
        </div>
      ))}
    </div>
  );
}