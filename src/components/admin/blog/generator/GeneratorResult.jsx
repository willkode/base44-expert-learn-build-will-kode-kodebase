import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  CheckCircle2, AlertTriangle, ExternalLink, Save, ThumbsUp, Send, Image as ImageIcon, Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import BlogContent from "@/components/learn/BlogContent";

// Quality checks computed from the generated draft.
function qualityChecks(post, generated) {
  const mt = (post.metaTitle || "").length;
  const md = (post.metaDescription || "").length;
  return [
    { label: "Has a title", ok: !!post.title },
    { label: "Has an excerpt", ok: !!post.excerpt },
    { label: "Meta title ≤ 60 chars", ok: mt > 0 && mt <= 60 },
    { label: "Meta description 80–160 chars", ok: md >= 80 && md <= 160 },
    { label: "Article body present", ok: (post.content || "").length > 300 },
    { label: "Featured image", ok: !!post.coverImageUrl },
    { label: "Tags suggested", ok: (post.tags || []).length > 0 },
    { label: "No quality warnings", ok: (generated.quality_warnings || []).length === 0 },
  ];
}

export default function GeneratorResult({ post: initial, generated, onReset }) {
  const [post, setPost] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setPost((p) => ({ ...p, [k]: v }));

  const persist = async (patch, msg) => {
    setSaving(true);
    const next = { ...post, ...patch };
    const { id, created_date, updated_date, created_by_id, created_by, ...data } = next;
    const saved = await base44.entities.BlogPost.update(post.id, { ...data, lastUpdatedAt: new Date().toISOString() });
    setPost(saved);
    setSaving(false);
    toast.success(msg);
  };

  const saveDraft = () => persist({ title: post.title, excerpt: post.excerpt, content: post.content, metaTitle: post.metaTitle, metaDescription: post.metaDescription, tags: post.tags, status: "draft", approvalStatus: "draft" }, "Saved as draft");
  const submitReview = () => persist({ status: "needs_review", approvalStatus: "needs_review" }, "Submitted for approval");
  const approve = () => persist({ status: "approved", approvalStatus: "approved", approvedBy: "admin", approvedAt: new Date().toISOString() }, "Approved");
  const publish = () => persist({ status: "published", approvalStatus: "approved", published: true, publishedAt: new Date().toISOString().slice(0, 10) }, "Published");

  const checks = qualityChecks(post, generated);
  const titleOptions = generated.title_options || [];

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card/60 p-4">
        <Badge variant="secondary" className="capitalize">{(post.status || "draft").replace(/_/g, " ")}</Badge>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={saveDraft} disabled={saving} className="gap-1.5"><Save className="w-4 h-4" /> Save draft</Button>
        <Button variant="outline" size="sm" onClick={submitReview} disabled={saving} className="gap-1.5"><Send className="w-4 h-4" /> Submit for approval</Button>
        <Button variant="outline" size="sm" onClick={approve} disabled={saving} className="gap-1.5"><ThumbsUp className="w-4 h-4" /> Approve</Button>
        <Button size="sm" onClick={publish} disabled={saving || post.approvalStatus !== "approved"} className="gap-1.5"><CheckCircle2 className="w-4 h-4" /> Publish</Button>
        <Button asChild variant="outline" size="sm" className="gap-1.5"><Link to={`/admin/marketing/blog/posts/${post.id}/edit`}><Pencil className="w-4 h-4" /> Open in editor</Link></Button>
        <Button variant="ghost" size="sm" onClick={onReset}>New</Button>
      </div>

      {generated.quality_warnings?.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2 text-amber-500 text-sm font-medium mb-1"><AlertTriangle className="w-4 h-4" /> Quality warnings</div>
          <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
            {generated.quality_warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-6">
          {/* Title options */}
          {titleOptions.length > 1 && (
            <div className="rounded-2xl border border-border bg-card/60 p-5">
              <Label className="mb-2 block">Title options</Label>
              <div className="space-y-2">
                {titleOptions.map((t, i) => (
                  <button key={i} onClick={() => set("title", t)} className={`w-full text-left text-sm rounded-lg border p-2.5 transition-colors ${post.title === t ? "border-primary bg-primary/10" : "border-border hover:bg-secondary"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Editable draft */}
          <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-4">
            <div>
              <Label className="mb-1.5 block">Title</Label>
              <Input value={post.title || ""} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Excerpt</Label>
              <Textarea value={post.excerpt || ""} onChange={(e) => set("excerpt", e.target.value)} className="h-16" />
            </div>
            <div>
              <Label className="mb-1.5 block">Article body (markdown)</Label>
              <Textarea value={post.content || ""} onChange={(e) => set("content", e.target.value)} className="h-72 font-mono text-xs" />
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-2xl border border-border bg-card/60 p-5">
            <Label className="mb-3 block">Preview</Label>
            <BlogContent content={post.content} />
          </div>

          {/* Outline */}
          {generated.outline?.length > 0 && (
            <div className="rounded-2xl border border-border bg-card/60 p-5">
              <Label className="mb-2 block">Outline</Label>
              <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                {generated.outline.map((o, i) => <li key={i}>{o}</li>)}
              </ol>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quality checklist */}
          <div className="rounded-2xl border border-border bg-card/60 p-5">
            <Label className="mb-3 block">Quality checklist</Label>
            <ul className="space-y-2">
              {checks.map((c, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  {c.ok ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                  <span className={c.ok ? "text-muted-foreground" : "text-foreground"}>{c.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* SEO fields */}
          <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-3">
            <Label className="block">SEO fields</Label>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Meta title ({(post.metaTitle || "").length})</Label>
              <Input value={post.metaTitle || ""} onChange={(e) => set("metaTitle", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Meta description ({(post.metaDescription || "").length})</Label>
              <Textarea value={post.metaDescription || ""} onChange={(e) => set("metaDescription", e.target.value)} className="h-16" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Slug</Label>
              <Input value={post.slug || ""} readOnly className="text-muted-foreground" />
            </div>
          </div>

          {/* Category & tags */}
          <div className="rounded-2xl border border-border bg-card/60 p-5">
            <Label className="mb-2 block">Suggestions</Label>
            <p className="text-xs text-muted-foreground mb-1">Category</p>
            <Badge variant="secondary" className="mb-3">{post.category || "—"}</Badge>
            <p className="text-xs text-muted-foreground mb-1">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {(post.tags || []).map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
            </div>
          </div>

          {/* Featured image */}
          <div className="rounded-2xl border border-border bg-card/60 p-5">
            <Label className="mb-2 block flex items-center gap-1.5"><ImageIcon className="w-4 h-4" /> Featured image</Label>
            {post.coverImageUrl ? (
              <img src={post.coverImageUrl} alt={post.featuredImageAlt || ""} className="w-full aspect-[16/9] object-cover rounded-lg mb-2" />
            ) : (
              <div className="w-full aspect-[16/9] rounded-lg blueprint-grid opacity-40 mb-2" />
            )}
            {post.featuredImagePrompt && <p className="text-xs text-muted-foreground">{post.featuredImagePrompt}</p>}
          </div>

          {post.slug && (
            <Link to={`/learn/blog/${post.slug}`} target="_blank" className="inline-flex items-center gap-1.5 text-sm text-primary">
              <ExternalLink className="w-4 h-4" /> View public page
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}