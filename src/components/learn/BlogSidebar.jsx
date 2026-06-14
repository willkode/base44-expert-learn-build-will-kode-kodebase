import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackEvent, trackNewsletterSignup } from "@/lib/analytics";

function NewsletterBox() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;
    setStatus("loading");
    try {
      await base44.functions.invoke("subscribeNewsletter", { email: email.trim() });
      trackNewsletterSignup("blog_sidebar");
      setStatus("done");
    } catch {
      setStatus("idle");
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card/70 p-6 glow-orange">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        <Mail className="w-5 h-5 text-primary" />
      </div>
      <h3 className="font-sora font-bold text-base mb-1.5">Build better with Base44</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Get new tutorials, prompts, and build guides in your inbox.
      </p>
      {status === "done" ? (
        <p className="text-sm text-primary font-medium">You're subscribed. 🎉</p>
      ) : (
        <form onSubmit={submit} className="space-y-2.5">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="bg-secondary border-border"
          />
          <Button type="submit" disabled={status === "loading"} className="w-full font-semibold">
            {status === "loading" ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
      )}
    </div>
  );
}

function RelatedPosts({ currentSlug, category }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    base44.entities.BlogPost.filter({ published: true }, "-publishedAt", 6).then((d) => {
      setPosts(d.filter((p) => p.slug !== currentSlug).slice(0, 4));
    });
  }, [currentSlug]);

  if (posts.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card/70 p-6">
      <h3 className="font-sora font-bold text-base mb-4">More articles</h3>
      <div className="space-y-4">
        {posts.map((p) => (
          <Link
            key={p.id}
            to={`/learn/blog/${p.slug}`}
            onClick={() => trackEvent("select_related_post", { post_title: p.title })}
            className="group flex gap-3 items-start"
          >
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-secondary shrink-0">
              {p.coverImageUrl ? (
                <img src={p.coverImageUrl} alt={p.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full blueprint-grid opacity-40" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {p.title}
              </p>
              {p.category && <span className="text-xs text-muted-foreground">{p.category}</span>}
            </div>
          </Link>
        ))}
      </div>
      <Link
        to="/learn/blog"
        className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-5 hover:gap-2 transition-all"
      >
        View all <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

export default function BlogSidebar({ currentSlug, category }) {
  return (
    <aside className="space-y-6 lg:sticky lg:top-24">
      <NewsletterBox />
      <RelatedPosts currentSlug={currentSlug} category={category} />
    </aside>
  );
}