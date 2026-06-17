import React from "react";
import { Hash, Image as ImageIcon, Megaphone, RefreshCw, Loader2, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { scoreColor } from "./studioConfig";

function AssetRow({ icon: Icon, label, target, onRegenerate, regenerating, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5 text-sm"><Icon className="w-4 h-4 text-primary" /> {label}</Label>
        <Button variant="ghost" size="sm" onClick={() => onRegenerate(target)} disabled={regenerating}>
          {regenerating ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1" />}
          Regenerate
        </Button>
      </div>
      {children}
    </div>
  );
}

export default function GlobalAssetsPanel({ result, onChange, onRegenerate, regenerating }) {
  const set = (field, value) => onChange({ ...result, [field]: value });
  const checklist = result.quality_checklist || [];

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-sora font-semibold">Shared Assets</h3>
        {result.quality_score != null && (
          <div className="text-right">
            <span className={`font-sora font-bold text-lg ${scoreColor(result.quality_score)}`}>{result.quality_score}</span>
            <span className="text-xs text-muted-foreground">/100 quality</span>
          </div>
        )}
      </div>

      <AssetRow icon={Hash} label="Global hashtags" target="hashtags" onRegenerate={onRegenerate} regenerating={regenerating === "hashtags"}>
        <Input
          value={(result.global_hashtags || []).join(" ")}
          onChange={(e) => set("global_hashtags", e.target.value.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean))}
          placeholder="#tag1 #tag2"
        />
      </AssetRow>

      <AssetRow icon={Megaphone} label="Call to action" target="cta" onRegenerate={onRegenerate} regenerating={regenerating === "cta"}>
        <Input value={result.cta || ""} onChange={(e) => set("cta", e.target.value)} placeholder="Start building today →" />
      </AssetRow>

      <AssetRow icon={ImageIcon} label="Image prompt" target="image_prompt" onRegenerate={onRegenerate} regenerating={regenerating === "image_prompt"}>
        <Textarea rows={3} value={result.image_prompt || ""} onChange={(e) => set("image_prompt", e.target.value)} />
        <Input
          className="mt-2"
          value={result.image_alt_text || ""}
          onChange={(e) => set("image_alt_text", e.target.value)}
          placeholder="Image alt text"
        />
      </AssetRow>

      {checklist.length > 0 && (
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-sm"><ShieldCheck className="w-4 h-4 text-primary" /> Quality checklist</Label>
          <div className="space-y-1.5">
            {checklist.map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                {c.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <span className={c.passed ? "text-muted-foreground" : "text-foreground"}>
                  <span className="font-medium">{c.label}</span>{c.detail ? ` — ${c.detail}` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.compliance_notes && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
          <p className="text-xs text-amber-400">{result.compliance_notes}</p>
        </div>
      )}
    </div>
  );
}