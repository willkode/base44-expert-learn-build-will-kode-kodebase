import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, CalendarDays, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import Seo from "@/components/seo/Seo";
import { SITE, canonical } from "@/lib/seo";
import BlogContent from "@/components/learn/BlogContent";
import BlogSidebar from "@/components/learn/BlogSidebar";
import BlogShare from "@/components/learn/BlogShare";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LoadingState from "@/components/shared/LoadingState";
import { fetchPublishedPost } from "@/lib/blogPublic";
import { trackBlogView, trackBlogClick } from "@/lib/blogTracking";
import useBlogScrollTracking from "@/hooks/useBlogScrollTracking";

const toSlug = (s) => (s || "").toLowerCase().replace(/\s+/g, "-");

// Build a simple table of contents from markdown headings (## / ###).
function buildToc(content) {
  if (!content) return [];
  const lines = content.split("\n");
  const items = [];
  lines.forEach((line) => {
    const m = /^(#{1,3})\s+(.*)/.exec(line.trim());
    if (m) {
      const text = m[2].replace(/[#*`]/g, "").trim();
      items.push({ level: m[1].length, text });
    }
  });
  return items.length >= 2 ? items : [];
}

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    setLoading(true);
    // Security: getPublicBlog (service role) only ever returns published posts.
    fetchPublishedPost(slug).then(({ post: found, settings: s }) => {
      setPost(found);
      setSettings(s || {});
      setLoading(false);
      if (found) trackBlogView(found.slug);
    });
  }, [slug]);

  // Scroll-depth + time-on-page tracking (only for genuinely published posts).
  useBlogScrollTracking(post?.slug, !!post);

  const toc = useMemo(() => buildToc(post?.content), [post]);
  const showToc = !!(settings?.showTableOfContents && toc.length);
  const showRelated = settings?.showRelatedPosts !== false;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32">
        <LoadingState label="Loading post..." />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <Seo title="Post not found — KodeBase" path={`/learn/blog/${slug}`} noindex />
        <h1 className="font-sora font-extrabold text-3xl mb-4">Post not found</h1>
        <p className="text-muted-foreground mb-8">This article doesn't exist, is not published, or has been removed.</p>
        <Link to="/learn/blog" className="inline-flex items-center gap-2 text-primary font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to blog
        </Link>
      </div>
    );
  }

  const ogImage = post.ogImageUrl || post.coverImageUrl || SITE.ogImage;
  const path = `/learn/blog/${post.slug}`;
  const published = post.publishedAt || post.created_date;
  const updated = post.lastUpdatedAt || post.updated_date;
  const showUpdated = updated && published && new Date(updated) - new Date(published) > 86400000;
  const tags = post.tags || [];

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || post.title,
    image: ogImage,
    datePublished: published,
    dateModified: updated || published,
    author: { "@type": "Person", name: post.author || settings?.defaultAuthorName || SITE.name },
    publisher: { "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: SITE.logo } },
    mainEntityOfPage: canonical(path),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Blog", item: canonical("/learn/blog") },
      ...(post.category
        ? [{ "@type": "ListItem", position: 2, name: post.category, item: canonical(`/learn/blog/category/${toSlug(post.category)}`) }]
        : []),
      { "@type": "ListItem", position: post.category ? 3 : 2, name: post.title, item: canonical(path) },
    ],
  };

  return (
    <>
      <Seo
        title={post.metaTitle || `${post.title} — KodeBase`}
        description={post.metaDescription || post.excerpt || post.title}
        path={path}
        type="article"
        image={ogImage}
        jsonLd={[articleSchema, breadcrumbSchema]}
      />
      <article className="relative">
        <div className="absolute inset-0 blueprint-grid opacity-20" />
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <Link
            to="/learn/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" /> Back to blog
          </Link>

          {/* Title header */}
          <div className="max-w-3xl mb-10">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-5">
              {post.category && (
                <Link
                  to={`/learn/blog/category/${toSlug(post.category)}`}
                  className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
                >
                  {post.category}
                </Link>
              )}
              {post.readMinutes ? (
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {post.readMinutes} min read
                </span>
              ) : null}
            </div>

            <h1 className="font-sora font-extrabold text-3xl md:text-5xl tracking-tight leading-[1.1] mb-5">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>
            )}
          </div>

          {/* Two-column: content + sticky sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-10 lg:gap-14">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-8">
                {(post.author || settings?.defaultAuthorName) && (
                  <span className="font-medium text-foreground">{post.author || settings.defaultAuthorName}</span>
                )}
                {published && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" /> {format(new Date(published), "MMMM d, yyyy")}
                  </span>
                )}
                {showUpdated && (
                  <span className="inline-flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> Updated {format(new Date(updated), "MMM d, yyyy")}
                  </span>
                )}
                <div className="ml-auto"><BlogShare post={post} /></div>
              </div>

              {post.coverImageUrl && (
                <img
                  src={post.coverImageUrl}
                  alt={post.featuredImageAlt || post.title}
                  className="w-full aspect-[16/9] object-cover rounded-2xl border border-border mb-10"
                />
              )}

              {showToc && (
                <nav className="rounded-2xl border border-border bg-card/60 p-5 mb-10">
                  <p className="font-sora font-semibold text-sm mb-3">On this page</p>
                  <ul className="space-y-1.5">
                    {toc.map((t, i) => (
                      <li key={i} className={t.level === 3 ? "pl-4" : ""}>
                        <span className="text-sm text-muted-foreground">{t.text}</span>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}

              <BlogContent content={post.content} onLinkClick={() => trackBlogClick(post.slug, "internal_link")} />

              {/* Tags */}
              {tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-border flex flex-wrap items-center gap-2">
                  {tags.map((t) => (
                    <Link key={t} to={`/learn/blog/tag/${toSlug(t)}`}>
                      <Badge variant="secondary" className="text-xs hover:bg-primary/20 transition-colors">#{t}</Badge>
                    </Link>
                  ))}
                </div>
              )}

              {/* CTA block */}
              <div className="mt-12 rounded-2xl border border-border bg-card/70 p-8 text-center glow-orange">
                <h3 className="font-sora font-bold text-xl mb-2">Turn your idea into a build-ready blueprint</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Generate your data model, roles, security rules, and copy-paste build prompts in minutes.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="font-semibold gap-2 bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] hover:opacity-90 text-white border-0"
                  >
                    <Link to="/pricing" onClick={() => trackBlogClick(post.slug, "cta")}>
                      Get started free
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="font-semibold">
                    <Link to="/products" onClick={() => trackBlogClick(post.slug, "products_cta")}>
                      Browse our products
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            <BlogSidebar currentSlug={post.slug} category={post.category} />
          </div>
        </div>
      </article>
    </>
  );
}