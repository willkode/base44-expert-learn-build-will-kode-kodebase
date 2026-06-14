import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Check, Star } from "lucide-react";
import Seo from "@/components/seo/Seo";
import BlogContent from "@/components/learn/BlogContent";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingState from "@/components/shared/LoadingState";
import { SITE } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";

export default function PromptPostDetail() {
  const { slug } = useParams();
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    base44.entities.LibraryPrompt.filter({ slug }).then((rows) => {
      if (!active) return;
      const p = rows[0] || null;
      setPrompt(p);
      setLoading(false);
      if (p) trackEvent("view_prompt_post", { prompt_title: p.title, prompt_category: p.category, page_path: window.location.pathname });
    });
    return () => { active = false; };
  }, [slug]);

  const copyPrompt = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt.promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackEvent("copy_prompt", { prompt_title: prompt.title, prompt_category: prompt.category, page_path: window.location.pathname });
  };

  if (loading) {
    return <div className="pt-32 pb-24"><LoadingState /></div>;
  }

  if (!prompt) {
    return (
      <div className="pt-40 pb-24 text-center max-w-xl mx-auto px-6">
        <Seo title="Prompt not found | KodeBase" description="This prompt could not be found." path={`/learn/prompt-library/${slug}`} noindex />
        <h1 className="font-sora font-bold text-2xl mb-3">Prompt not found</h1>
        <p className="text-muted-foreground mb-6">This prompt may have been moved or removed.</p>
        <Button asChild><Link to="/learn/prompt-library">Back to Prompt Library</Link></Button>
      </div>
    );
  }

  return (
    <>
      <Seo
        title={prompt.seoTitle || `${prompt.title} | Base44 Prompt | KodeBase`}
        description={prompt.seoDescription || prompt.description}
        path={`/learn/prompt-library/${prompt.slug}`}
        type="article"
        image={prompt.imageUrl || SITE.ogImage}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: prompt.title,
          description: prompt.seoDescription || prompt.description,
          image: prompt.imageUrl || SITE.ogImage,
          articleSection: prompt.category,
          publisher: { "@type": "Organization", name: SITE.name, logo: SITE.logo },
        }}
      />

      <article className="relative">
        <div className="absolute inset-0 blueprint-grid opacity-20" />
        <div className="relative max-w-3xl mx-auto px-6 pt-28 pb-24">
          <Link to="/learn/prompt-library" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-10">
            <ArrowLeft className="w-4 h-4" /> Back to Prompt Library
          </Link>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex items-center gap-3 text-xs mb-5">
              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">{prompt.category}</span>
              {prompt.featured && (
                <span className="inline-flex items-center gap-1 text-primary font-medium">
                  <Star className="w-3.5 h-3.5 fill-primary" /> Featured
                </span>
              )}
            </div>

            <h1 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight leading-tight mb-5">{prompt.title}</h1>
            {prompt.description && (
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">{prompt.description}</p>
            )}

            {prompt.imageUrl && (
              <img src={prompt.imageUrl} alt={prompt.title} className="w-full aspect-[16/9] object-cover rounded-2xl border border-border mb-10" />
            )}

            {prompt.guide && <BlogContent content={prompt.guide} />}

            <div className="rounded-2xl border border-border bg-card/70 overflow-hidden mt-10 glow-orange">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <span className="text-sm font-semibold font-sora">The prompt</span>
                <Button onClick={copyPrompt} variant="outline" size="sm" className="font-semibold">
                  {copied ? <><Check className="w-4 h-4 mr-1 text-green-500" /> Copied</> : <><Copy className="w-4 h-4 mr-1" /> Copy prompt</>}
                </Button>
              </div>
              <pre className="text-sm text-muted-foreground p-5 overflow-x-auto whitespace-pre-wrap font-inter leading-relaxed">
                {prompt.promptText}
              </pre>
            </div>

            {prompt.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8">
                {prompt.tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">#{t}</Badge>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </article>
    </>
  );
}