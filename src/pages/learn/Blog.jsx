import React, { useState, useEffect } from "react";
import { Newspaper } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Seo from "@/components/seo/Seo";
import BlogCard from "@/components/learn/BlogCard";
import LoadingState from "@/components/shared/LoadingState";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.BlogPost.filter({ published: true }, "-publishedAt", 200).then((d) => {
      setPosts(d);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <Seo
        title="Base44 Blog — Tutorials & Build Guides | KodeBase"
        description="Articles, tutorials, and deep dives on building production-grade apps with Base44 — from data models to launch."
        path="/learn/blog"
      />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-30" />
        <div className="relative max-w-6xl mx-auto px-6 py-28">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-7">
              <Newspaper className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-sora font-extrabold text-4xl md:text-5xl tracking-tight mb-5">
              <span className="text-gradient-orange">Blog</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Articles, tutorials, and deep dives on building production-grade apps with Base44.
            </p>
          </div>

          {loading ? (
            <LoadingState label="Loading posts..." />
          ) : posts.length === 0 ? (
            <div className="text-center text-muted-foreground py-16">No posts yet. Check back soon.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((p) => <BlogCard key={p.id} post={p} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}