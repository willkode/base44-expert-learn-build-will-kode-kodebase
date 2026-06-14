import React from "react";
import { Smartphone, Search, Share2, ListTree } from "lucide-react";
import BlogContent from "@/components/learn/BlogContent";
import { extractToc } from "@/lib/blogEditor";

function truncate(s, n) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

// Google search result preview
export function SearchPreview({ post }) {
  const title = post.metaTitle || post.title || "Untitled";
  const desc = post.metaDescription || post.excerpt || "";
  const url = `kodebase.com › learn › blog › ${post.slug || "your-slug"}`;
  return (
    <div className="rounded-xl border border-border bg-card/60 p-5">
      <div className="flex items-center gap-2 text-sm font-medium mb-3"><Search className="w-4 h-4 text-primary" /> Search result preview</div>
      <div className="rounded-lg bg-white p-4 max-w-xl">
        <p className="text-[#202124] text-xs truncate">{url}</p>
        <p className="text-[#1a0dab] text-lg leading-tight truncate">{truncate(title, 60)}</p>
        <p className="text-[#4d5156] text-sm mt-0.5">{truncate(desc, 160)}</p>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Title {(title || "").length}/60 · Description {(desc || "").length}/160
      </p>
    </div>
  );
}

// Social share card preview (Open Graph / Twitter)
export function SocialPreview({ post }) {
  const title = post.ogTitle || post.metaTitle || post.title || "Untitled";
  const desc = post.ogDescription || post.metaDescription || post.excerpt || "";
  const img = post.ogImageUrl || post.coverImageUrl || "";
  return (
    <div className="rounded-xl border border-border bg-card/60 p-5">
      <div className="flex items-center gap-2 text-sm font-medium mb-3"><Share2 className="w-4 h-4 text-primary" /> Social share preview</div>
      <div className="rounded-lg overflow-hidden border border-border max-w-md bg-secondary/40">
        {img ? (
          <img src={img} alt="" className="w-full aspect-[1.91/1] object-cover" />
        ) : (
          <div className="w-full aspect-[1.91/1] blueprint-grid opacity-40" />
        )}
        <div className="p-3">
          <p className="text-xs uppercase text-muted-foreground">kodebase.com</p>
          <p className="font-medium leading-tight mt-0.5">{truncate(title, 70)}</p>
          <p className="text-sm text-muted-foreground mt-1">{truncate(desc, 120)}</p>
        </div>
      </div>
    </div>
  );
}

// Mobile device frame preview
export function MobilePreview({ post }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-5">
      <div className="flex items-center gap-2 text-sm font-medium mb-3"><Smartphone className="w-4 h-4 text-primary" /> Mobile preview</div>
      <div className="mx-auto w-[320px] rounded-[2rem] border-4 border-border bg-background p-3 shadow-xl">
        <div className="h-[520px] overflow-y-auto rounded-2xl">
          {post.coverImageUrl && <img src={post.coverImageUrl} alt="" className="w-full aspect-video object-cover rounded-xl mb-3" />}
          <h1 className="font-sora font-bold text-lg leading-tight mb-2">{post.title || "Untitled"}</h1>
          {post.excerpt && <p className="text-sm text-muted-foreground mb-3">{post.excerpt}</p>}
          <BlogContent content={post.content} />
        </div>
      </div>
    </div>
  );
}

// Table of contents preview
export function TocPreview({ post }) {
  const toc = extractToc(post.content);
  return (
    <div className="rounded-xl border border-border bg-card/60 p-5">
      <div className="flex items-center gap-2 text-sm font-medium mb-3"><ListTree className="w-4 h-4 text-primary" /> Table of contents</div>
      {toc.length === 0 ? (
        <p className="text-sm text-muted-foreground">Add H2/H3 headings to build a table of contents.</p>
      ) : (
        <ul className="space-y-1.5 text-sm">
          {toc.map((h, i) => (
            <li key={i} className={h.level === 3 ? "ml-4 text-muted-foreground" : "text-foreground"}>{h.text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Full desktop article preview
export function DesktopPreview({ post }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-6">
      {post.coverImageUrl && <img src={post.coverImageUrl} alt={post.featuredImageAlt || ""} className="w-full aspect-video object-cover rounded-xl mb-6" />}
      <h1 className="font-sora font-bold text-3xl leading-tight mb-3">{post.title || "Untitled"}</h1>
      {post.excerpt && <p className="text-lg text-muted-foreground mb-6">{post.excerpt}</p>}
      <BlogContent content={post.content} />
    </div>
  );
}