import React from "react";
import { AlertTriangle, CheckCircle2, Clock, FileText, Timer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { POST_STATUSES, POST_TYPES, SEARCH_INTENTS } from "@/lib/blogEditor";

export default function EditorSidebar({ post, set, categories, tagsText, onTagsText, wordCount, readMinutes, validation }) {
  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="rounded-xl border border-border bg-card/60 p-4 flex items-center justify-around text-center">
        <div>
          <div className="flex items-center justify-center gap-1 text-lg font-semibold"><FileText className="w-4 h-4 text-primary" />{wordCount}</div>
          <p className="text-xs text-muted-foreground">words</p>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 text-lg font-semibold"><Timer className="w-4 h-4 text-primary" />{readMinutes}</div>
          <p className="text-xs text-muted-foreground">min read</p>
        </div>
      </div>

      {/* Publishing */}
      <div className="rounded-xl border border-border bg-card/60 p-4 space-y-4">
        <p className="text-sm font-medium">Publishing</p>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Status</Label>
          <Select value={post.status || "draft"} onValueChange={(v) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {POST_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {post.status === "scheduled" && (
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block flex items-center gap-1"><Clock className="w-3 h-3" /> Scheduled publish date</Label>
            <Input
              type="datetime-local"
              value={post.scheduledAt ? post.scheduledAt.slice(0, 16) : ""}
              onChange={(e) => set("scheduledAt", e.target.value ? new Date(e.target.value).toISOString() : "")}
            />
          </div>
        )}
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Post type</Label>
          <Select value={post.postType || "blog_post"} onValueChange={(v) => set("postType", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {POST_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g, " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Taxonomy */}
      <div className="rounded-xl border border-border bg-card/60 p-4 space-y-4">
        <p className="text-sm font-medium">Organization</p>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Category</Label>
          {categories.length > 0 ? (
            <Select value={post.categoryId || ""} onValueChange={(v) => {
              set("categoryId", v);
              const c = categories.find((x) => x.id === v);
              if (c) set("category", c.name);
            }}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : (
            <Input value={post.category || ""} onChange={(e) => set("category", e.target.value)} placeholder="General" />
          )}
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Tags (comma separated)</Label>
          <Input value={tagsText} onChange={(e) => onTagsText(e.target.value)} placeholder="tutorial, base44" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Author</Label>
          <Input value={post.author || ""} onChange={(e) => set("author", e.target.value)} placeholder="KodeBase Team" />
        </div>
      </div>

      {/* SEO targeting */}
      <div className="rounded-xl border border-border bg-card/60 p-4 space-y-4">
        <p className="text-sm font-medium">SEO targeting</p>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Target keyword</Label>
          <Input value={post.targetKeyword || ""} onChange={(e) => set("targetKeyword", e.target.value)} />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Search intent</Label>
          <Select value={post.searchIntent || "informational"} onValueChange={(v) => set("searchIntent", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SEARCH_INTENTS.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Internal notes */}
      <div className="rounded-xl border border-border bg-card/60 p-4">
        <Label className="text-sm font-medium mb-2 block">Internal notes</Label>
        <Textarea value={post.revisionNotes || ""} onChange={(e) => set("revisionNotes", e.target.value)} placeholder="Private notes — never shown publicly" className="h-20" />
      </div>

      {/* Validation */}
      {validation && (
        <div className="rounded-xl border border-border bg-card/60 p-4">
          <p className="text-sm font-medium mb-2">Pre-publish checks</p>
          {validation.errors.length === 0 && validation.recommendations.length === 0 ? (
            <p className="flex items-center gap-1.5 text-sm text-green-500"><CheckCircle2 className="w-4 h-4" /> Ready to publish</p>
          ) : (
            <ul className="space-y-1.5">
              {validation.errors.map((e, i) => (
                <li key={`e${i}`} className="flex items-start gap-1.5 text-xs text-destructive"><AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />{e}</li>
              ))}
              {validation.recommendations.map((r, i) => (
                <li key={`r${i}`} className="flex items-start gap-1.5 text-xs text-amber-500"><AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />{r}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}