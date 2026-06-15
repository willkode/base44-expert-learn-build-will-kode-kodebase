import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function StudioEditor({ draft, onChange }) {
  const set = (field) => (e) => onChange({ ...draft, [field]: e.target.value });

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h3 className="font-sora font-semibold">Editor</h3>

      <div className="space-y-2">
        <Label>Campaign name (internal)</Label>
        <Input value={draft.name} onChange={set("name")} placeholder="June product launch" />
      </div>

      <div className="space-y-2">
        <Label>Subject line</Label>
        <Input value={draft.subject} onChange={set("subject")} placeholder="Subject" />
      </div>

      <div className="space-y-2">
        <Label>Preview text</Label>
        <Input value={draft.previewText} onChange={set("previewText")} placeholder="Preheader shown in inbox" />
      </div>

      <div className="space-y-2">
        <Label>HTML body</Label>
        <Textarea
          value={draft.htmlContent}
          onChange={set("htmlContent")}
          rows={12}
          className="font-mono text-xs"
          placeholder="<div>…</div>"
        />
      </div>

      <div className="space-y-2">
        <Label>Plain-text body</Label>
        <Textarea
          value={draft.textContent}
          onChange={set("textContent")}
          rows={6}
          className="font-mono text-xs"
          placeholder="Plain-text version"
        />
      </div>
    </div>
  );
}