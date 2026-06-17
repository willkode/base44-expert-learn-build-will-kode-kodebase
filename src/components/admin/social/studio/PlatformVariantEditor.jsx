import React from "react";
import { Check, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PLATFORM_MAP } from "@/components/admin/social/socialConfig";
import { platformWarnings } from "./studioConfig";

function VariantField({ label, children }) {
  return (
    <div>
      <Label className="mb-1 block text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function hashtagsToString(arr) {
  return (arr || []).join(" ");
}
function stringToHashtags(str) {
  return str.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
}

export default function PlatformVariantEditor({ platform, variants, selectedIndex, onSelect, onChange, onRegenerate, regenerating }) {
  const meta = PLATFORM_MAP[platform];
  const Icon = meta?.icon;

  if (!variants || variants.length === 0) return null;

  const updateField = (idx, field, value) => {
    const next = variants.map((v, i) => (i === idx ? { ...v, [field]: value } : v));
    onChange(platform, next);
  };

  return (
    <div className="rounded-2xl border border-border bg-card/60 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/40">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-primary" />}
          <span className="font-sora font-semibold text-sm">{meta?.label || platform}</span>
          <Badge variant="secondary" className="text-xs">{variants.length} variants</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onRegenerate(platform)} disabled={regenerating}>
          {regenerating ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1" />}
          Regenerate
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {variants.map((v, idx) => {
          const isSelected = selectedIndex === idx;
          const warnings = platformWarnings(platform, v);
          return (
            <div
              key={idx}
              className={`rounded-xl border p-3 space-y-3 transition-colors ${
                isSelected ? "border-primary/60 bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs capitalize">{v.variant_label || `Variant ${idx + 1}`}</Badge>
                <Button
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSelect(platform, idx)}
                >
                  <Check className="w-3.5 h-3.5 mr-1" /> {isSelected ? "Selected" : "Use this"}
                </Button>
              </div>

              {/* Platform-specific fields */}
              {platform === "twitter" && (
                <>
                  <VariantField label="Tweet">
                    <Textarea rows={3} value={v.text || ""} onChange={(e) => updateField(idx, "text", e.target.value)} />
                  </VariantField>
                  {(v.thread || []).length > 0 && (
                    <VariantField label="Thread">
                      <Textarea
                        rows={4}
                        value={(v.thread || []).join("\n")}
                        onChange={(e) => updateField(idx, "thread", e.target.value.split("\n"))}
                      />
                    </VariantField>
                  )}
                </>
              )}

              {platform === "reddit" && (
                <>
                  <VariantField label="Title">
                    <Input value={v.title || ""} onChange={(e) => updateField(idx, "title", e.target.value)} />
                  </VariantField>
                  <VariantField label="Body">
                    <Textarea rows={4} value={v.body || ""} onChange={(e) => updateField(idx, "body", e.target.value)} />
                  </VariantField>
                  <VariantField label="Subreddit targeting notes">
                    <Textarea rows={2} value={v.subreddit_notes || ""} onChange={(e) => updateField(idx, "subreddit_notes", e.target.value)} />
                  </VariantField>
                  {v.disclosure_suggestion && (
                    <p className="text-xs text-amber-400">Disclosure: {v.disclosure_suggestion}</p>
                  )}
                </>
              )}

              {platform === "linkedin" && (
                <VariantField label="Post">
                  <Textarea rows={5} value={v.text || ""} onChange={(e) => updateField(idx, "text", e.target.value)} />
                </VariantField>
              )}

              {platform === "facebook" && (
                <>
                  <VariantField label="Post">
                    <Textarea rows={4} value={v.text || ""} onChange={(e) => updateField(idx, "text", e.target.value)} />
                  </VariantField>
                  <div className="grid grid-cols-2 gap-3">
                    <VariantField label="CTA">
                      <Input value={v.cta || ""} onChange={(e) => updateField(idx, "cta", e.target.value)} />
                    </VariantField>
                    <VariantField label="Link URL">
                      <Input value={v.link_url || ""} onChange={(e) => updateField(idx, "link_url", e.target.value)} />
                    </VariantField>
                  </div>
                </>
              )}

              {platform === "instagram" && (
                <>
                  <VariantField label="Caption">
                    <Textarea rows={4} value={v.caption || ""} onChange={(e) => updateField(idx, "caption", e.target.value)} />
                  </VariantField>
                  <div className="grid grid-cols-2 gap-3">
                    <VariantField label="Media type">
                      <Input value={v.media_type || ""} onChange={(e) => updateField(idx, "media_type", e.target.value)} />
                    </VariantField>
                    <VariantField label="First comment">
                      <Input value={v.first_comment || ""} onChange={(e) => updateField(idx, "first_comment", e.target.value)} />
                    </VariantField>
                  </div>
                  <VariantField label="Image / Reel concept">
                    <Textarea rows={2} value={v.image_or_reel_prompt || ""} onChange={(e) => updateField(idx, "image_or_reel_prompt", e.target.value)} />
                  </VariantField>
                  <VariantField label="Alt text">
                    <Input value={v.alt_text || ""} onChange={(e) => updateField(idx, "alt_text", e.target.value)} />
                  </VariantField>
                </>
              )}

              {/* Hashtags (shared) */}
              {Array.isArray(v.hashtags) && platform !== "reddit" && (
                <VariantField label="Hashtags">
                  <Input
                    value={hashtagsToString(v.hashtags)}
                    onChange={(e) => updateField(idx, "hashtags", stringToHashtags(e.target.value))}
                    placeholder="#tag1 #tag2"
                  />
                </VariantField>
              )}

              {warnings.length > 0 && (
                <div className="space-y-1">
                  {warnings.map((w, i) => (
                    <p key={i} className="flex items-start gap-1.5 text-xs text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {w}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}