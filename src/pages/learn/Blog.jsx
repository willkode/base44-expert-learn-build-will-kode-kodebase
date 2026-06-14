import React, { useState, useEffect, useMemo } from "react";
import { Newspaper } from "lucide-react";
import Seo from "@/components/seo/Seo";
import { SITE, canonical } from "@/lib/seo";
import BlogCard from "@/components/learn/BlogCard";
import BlogFeatured from "@/components/learn/BlogFeatured";
import BlogFilters from "@/components/learn/BlogFilters";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { fetchPublishedPosts, collectCategories, collectTags } from "@/lib/blogPublic";
import { trackEvent } from "@/lib/analytics";

const PAGE_SIZE = 6;

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTag, setActiveTag] = useState(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    fetchPublishedPosts().then((d) => {
      setPosts(d);
      setLoading(false);
      trackEvent("view_blog_index", { post_count: d.length });
    });
  }, []);

  const categories = useMemo(() => collectCategories(posts), [posts]);
  const tags = useMemo(() => collectTags(posts), [posts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false;
      if (activeTag && !(p.tags || []).includes(activeTag)) return false;
      if (q) {
        const hay = `${p.title || ""} ${p.excerpt || ""} ${p.category || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [posts, search, activeCategory, activeTag]);

  const hasFilters = !!(search || activeCategory || activeTag);
  const featured = !hasFilters ? filtered[0] : null;
  const gridPosts = featured ? filtered.slice(1) : filtered;
  const shown = gridPosts.slice(0, visible);

  useEffect(() => setVisible(PAGE_SIZE), [search, activeCategory, activeTag]);

  return (
    <>
      <Seo
        title="Base44 Blog — Tutorials & Build Guides | KodeBase"
        description="Articles, tutorials, and deep dives on building production-grade apps with Base44 — from data models to launch."
        path="/learn/blog"
        image={SITE.ogImage}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "KodeBase Blog",
          url: canonical("/learn/blog"),
          description:
            "Articles, tutorials, and deep dives on building production-grade apps with Base44.",
          publisher: { "@type": "Organization", name: SITE.name, logo: SITE.logo },
        }}
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
            <EmptyState
              icon={Newspaper}
              title="No posts yet"
              description="New tutorials and build guides are on the way. Check back soon."
            />
          ) : (
            <>
              <BlogFilters
                search={search}
                onSearch={setSearch}
                categories={categories}
                tags={tags}
                activeCategory={activeCategory}
                activeTag={activeTag}
                onCategory={setActiveCategory}
                onTag={setActiveTag}
              />

              {featured && <BlogFeatured post={featured} />}

              {shown.length === 0 ? (
                <EmptyState
                  icon={Newspaper}
                  title="No matching articles"
                  description="Try a different search term, category, or tag."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {shown.map((p) => <BlogCard key={p.id} post={p} />)}
                </div>
              )}

              {visible < gridPosts.length && (
                <div className="text-center mt-12">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setVisible((v) => v + PAGE_SIZE);
                      trackEvent("blog_load_more");
                    }}
                  >
                    Load more articles
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}