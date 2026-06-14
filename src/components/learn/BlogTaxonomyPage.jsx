import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Newspaper } from "lucide-react";
import Seo from "@/components/seo/Seo";
import { SITE, canonical } from "@/lib/seo";
import BlogCard from "@/components/learn/BlogCard";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { fetchPublishedPosts } from "@/lib/blogPublic";
import { trackEvent } from "@/lib/analytics";

const PAGE_SIZE = 9;
const toSlug = (s) => (s || "").toLowerCase().replace(/\s+/g, "-");

// Shared listing page for both category (/learn/blog/category/:slug)
// and tag (/learn/blog/tag/:slug) routes.
export default function BlogTaxonomyPage({ kind, slug }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const isCategory = kind === "category";

  useEffect(() => {
    fetchPublishedPosts().then((d) => {
      setPosts(d);
      setLoading(false);
    });
    setVisible(PAGE_SIZE);
  }, [slug]);

  const { label, matches } = useMemo(() => {
    if (isCategory) {
      const m = posts.filter((p) => toSlug(p.category) === slug);
      return { label: m[0]?.category || slug.replace(/-/g, " "), matches: m };
    }
    const m = posts.filter((p) => (p.tags || []).some((t) => toSlug(t) === slug));
    let label = slug.replace(/-/g, " ");
    for (const p of m) {
      const found = (p.tags || []).find((t) => toSlug(t) === slug);
      if (found) { label = found; break; }
    }
    return { label, matches: m };
  }, [posts, slug, isCategory]);

  const shown = matches.slice(0, visible);
  const basePath = isCategory ? "category" : "tag";
  const path = `/learn/blog/${basePath}/${slug}`;
  const heading = isCategory ? label : `#${label}`;
  const title = isCategory
    ? `${label} Articles — KodeBase Blog`
    : `Posts tagged “${label}” — KodeBase Blog`;
  const description = isCategory
    ? `Browse all ${label} tutorials and build guides on the KodeBase blog.`
    : `All KodeBase articles tagged ${label} — tutorials, guides, and deep dives.`;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-32">
        <LoadingState label="Loading posts..." />
      </div>
    );
  }

  return (
    <>
      <Seo
        title={title}
        description={description}
        path={path}
        image={SITE.ogImage}
        noindex={matches.length === 0}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Blog", item: canonical("/learn/blog") },
            { "@type": "ListItem", position: 2, name: heading, item: canonical(path) },
          ],
        }}
      />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-30" />
        <div className="relative max-w-6xl mx-auto px-6 py-24">
          <Link
            to="/learn/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" /> Back to blog
          </Link>

          <div className="max-w-2xl mb-12">
            <p className="text-sm text-primary font-semibold uppercase tracking-wide mb-3">
              {isCategory ? "Category" : "Tag"}
            </p>
            <h1 className="font-sora font-extrabold text-3xl md:text-5xl tracking-tight mb-4 capitalize">
              {heading}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">{description}</p>
          </div>

          {shown.length === 0 ? (
            <EmptyState
              icon={Newspaper}
              title="No articles here yet"
              description="There are no published posts in this section right now. Explore the full blog instead."
              actionLabel="Browse all articles"
              onAction={() => { window.location.href = "/learn/blog"; }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shown.map((p) => <BlogCard key={p.id} post={p} />)}
            </div>
          )}

          {visible < matches.length && (
            <div className="text-center mt-12">
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setVisible((v) => v + PAGE_SIZE);
                  trackEvent("blog_taxonomy_load_more", { kind, slug });
                }}
              >
                Load more articles
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}