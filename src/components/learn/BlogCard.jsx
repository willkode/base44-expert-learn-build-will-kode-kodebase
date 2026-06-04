import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default function BlogCard({ post }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      <Link
        to={`/learn/blog/${post.slug}`}
        className="group flex flex-col h-full rounded-2xl border border-border bg-card/70 overflow-hidden hover:border-primary/30 transition-colors"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
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
        <div className="flex flex-col flex-1 p-6">
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            {post.category && (
              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                {post.category}
              </span>
            )}
            {post.readMinutes ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {post.readMinutes} min read
              </span>
            ) : null}
          </div>
          <h3 className="font-sora font-bold text-lg leading-snug mb-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
              {post.excerpt}
            </p>
          )}
          <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
            <span>
              {post.author ? `${post.author}` : ""}
              {post.author && post.publishedAt ? " · " : ""}
              {post.publishedAt ? format(new Date(post.publishedAt), "MMM d, yyyy") : ""}
            </span>
            <span className="inline-flex items-center gap-1 text-primary font-medium">
              Read <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}