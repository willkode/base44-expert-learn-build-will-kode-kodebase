import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <Label className="text-sm">{label}</Label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export default function SeoFields({ post, set }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Meta title" hint={`${(post.metaTitle || "").length}/60`}>
          <Input value={post.metaTitle || ""} onChange={(e) => set("metaTitle", e.target.value)} />
        </Field>
        <Field label="Canonical URL">
          <Input value={post.canonicalUrl || ""} onChange={(e) => set("canonicalUrl", e.target.value)} placeholder="https://..." />
        </Field>
      </div>
      <Field label="Meta description" hint={`${(post.metaDescription || "").length}/160`}>
        <Textarea value={post.metaDescription || ""} onChange={(e) => set("metaDescription", e.target.value)} className="h-16" />
      </Field>

      <div className="pt-2 border-t border-border">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Open Graph</p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="OG title"><Input value={post.ogTitle || ""} onChange={(e) => set("ogTitle", e.target.value)} /></Field>
            <Field label="OG image URL"><Input value={post.ogImageUrl || ""} onChange={(e) => set("ogImageUrl", e.target.value)} /></Field>
          </div>
          <Field label="OG description"><Textarea value={post.ogDescription || ""} onChange={(e) => set("ogDescription", e.target.value)} className="h-14" /></Field>
        </div>
      </div>

      <div className="pt-2 border-t border-border">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Twitter / X</p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Twitter title"><Input value={post.twitterTitle || ""} onChange={(e) => set("twitterTitle", e.target.value)} /></Field>
            <Field label="Twitter image URL"><Input value={post.twitterImageUrl || ""} onChange={(e) => set("twitterImageUrl", e.target.value)} /></Field>
          </div>
          <Field label="Twitter description"><Textarea value={post.twitterDescription || ""} onChange={(e) => set("twitterDescription", e.target.value)} className="h-14" /></Field>
        </div>
      </div>
    </div>
  );
}