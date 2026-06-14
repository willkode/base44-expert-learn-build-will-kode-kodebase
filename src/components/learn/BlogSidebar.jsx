import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Mail, ArrowRight, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackEvent, trackNewsletterSignup } from "@/lib/analytics";
import { isPublishedPost } from "@/lib/blogPublic";
import { trackBlogClick } from "@/lib/blogTracking";

const COFFEE_IMAGE = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/d6f4b2d9f_generated_image.png";

function CoffeeBox() {
  return (
    <div className="rounded-2xl border border-border bg-card/70 overflow-hidden">
      <img src={COFFEE_IMAGE} alt="Buy me a coffee" className="w-full aspect-[16/9] object-cover" />
      <div className="p-6">
        <h3 className="font-sora font-bold text-base mb-1.5">Enjoying the content?</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          These guides and prompts are free. If they help your builds, a coffee keeps the work going.
        </p>
        <Button
          asChild
          className="w-full font-semibold gap-2 bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] hover:opacity-90 text-white border-0"
        >
          <Link to="/coffee" onClick={() => trackEvent("cta_buy_me_a_coffee", { location: "blog_sidebar" })}>
            <Coffee className="w-4 h-4" /> Buy me a coffee
          </Link>
        </Button>
      </div>
    </div>
  );
}

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

function RelatedPosts({ currentSlug, variant = "blog" }) {
  const [posts, setPosts] = useState([]);
  const isPrompt = variant === "prompt";

  useEffect(() => {
    const loader = isPrompt
      ? base44.entities.LibraryPrompt.list("-order", 6)
      : base44.entities.BlogPost.list("-publishedAt", 20);
    loader.then((d) => {
      const cleaned = isPrompt ? d : d.filter(isPublishedPost);
      setPosts(cleaned.filter((p) => p.slug !== currentSlug).slice(0, 4));
    });
  }, [currentSlug, isPrompt]);

  if (posts.length === 0) return null;

  const basePath = isPrompt ? "/learn/prompt-library" : "/learn/blog";

  return (
    <div className="rounded-2xl border border-border bg-card/70 p-6">
      <h3 className="font-sora font-bold text-base mb-4">{isPrompt ? "More prompts" : "More articles"}</h3>
      <div className="space-y-4">
        {posts.map((p) => {
          const image = p.coverImageUrl || p.imageUrl;
          return (
            <Link
              key={p.id}
              to={`${basePath}/${p.slug}`}
              onClick={() => {
                trackEvent("select_related_post", { post_title: p.title });
                if (!isPrompt && currentSlug) trackBlogClick(currentSlug, "related_post");
              }}
              className="group flex gap-3 items-start"
            >
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-secondary shrink-0">
                {image ? (
                  <img src={image} alt={p.title} className="w-full h-full object-cover" />
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
          );
        })}
      </div>
      <Link
        to={basePath}
        className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-5 hover:gap-2 transition-all"
      >
        View all <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

export default function BlogSidebar({ currentSlug, variant = "blog" }) {
  return (
    <aside className="space-y-6 lg:sticky lg:top-24">
      <NewsletterBox />
      <CoffeeBox />
      <RelatedPosts currentSlug={currentSlug} variant={variant} />
    </aside>
  );
}