import React from "react";
import { Link } from "react-router-dom";
import { Clock, ArrowRight, Star } from "lucide-react";
import { format } from "date-fns";

// Large hero card for the single most-recent / featured published post.
export default function BlogFeatured({ post }) {
  if (!post) return null;
  return (
    <Link
      to={`/learn/blog/${post.slug}`}
      className="group grid grid-cols-1 lg:grid-cols-2 rounded-2xl border border-border bg-card/70 overflow-hidden hover:border-primary/30 transition-colors mb-12"
    >
      <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-secondary">
        {post.coverImageUrl ? (
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 blueprint-grid opacity-40" />
        )}
      </div>
      <div className="flex flex-col justify-center p-7 lg:p-10">
        <div className="flex items-center gap-3 text-xs mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-white font-semibold">
            <Star className="w-3.5 h-3.5" /> Featured
          </span>
          {post.category && (
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">{post.category}</span>
          )}
          {post.readMinutes ? (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" /> {post.readMinutes} min read
            </span>
          ) : null}
        </div>
        <h2 className="font-sora font-extrabold text-2xl md:text-3xl leading-tight mb-4 group-hover:text-primary transition-colors">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-muted-foreground leading-relaxed line-clamp-3 mb-6">{post.excerpt}</p>
        )}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {post.author ? `${post.author}` : ""}
            {post.author && post.publishedAt ? " · " : ""}
            {post.publishedAt ? format(new Date(post.publishedAt), "MMM d, yyyy") : ""}
          </span>
          <span className="inline-flex items-center gap-1 text-primary font-medium">
            Read article <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}