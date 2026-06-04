import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import Seo from "@/components/seo/Seo";
import BlogContent from "@/components/learn/BlogContent";
import LoadingState from "@/components/shared/LoadingState";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.BlogPost.filter({ slug }, "", 1).then((d) => {
      setPost(d[0] || null);
      setLoading(false);
    });
  }, [slug]);

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
        <Seo title="Post not found — KodeBase" noindex />
        <h1 className="font-sora font-extrabold text-3xl mb-4">Post not found</h1>
        <p className="text-muted-foreground mb-8">This article doesn't exist or has been removed.</p>
        <Link to="/learn/blog" className="inline-flex items-center gap-2 text-primary font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to blog
        </Link>
      </div>
    );
  }

  return (
    <>
      <Seo
        title={`${post.title} — KodeBase`}
        description={post.excerpt || post.title}
        path={`/learn/blog/${post.slug}`}
        type="article"
        image={post.coverImageUrl}
      />
      <article className="relative">
        <div className="absolute inset-0 blueprint-grid opacity-20" />
        <div className="relative max-w-3xl mx-auto px-6 py-20">
          <Link
            to="/learn/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" /> Back to blog
          </Link>

          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-5">
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

          <h1 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight leading-tight mb-5">
            {post.title}
          </h1>

          <div className="text-sm text-muted-foreground mb-8">
            {post.author ? `By ${post.author}` : ""}
            {post.author && post.publishedAt ? " · " : ""}
            {post.publishedAt ? format(new Date(post.publishedAt), "MMMM d, yyyy") : ""}
          </div>

          {post.coverImageUrl && (
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full aspect-[16/9] object-cover rounded-2xl border border-border mb-10"
            />
          )}

          <BlogContent content={post.content} />
        </div>
      </article>
    </>
  );
}