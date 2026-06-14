import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Copy, Check, Star } from "lucide-react";
import Seo from "@/components/seo/Seo";
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

      <article className="pt-28 pb-24 max-w-3xl mx-auto px-6">
        <Link to="/learn/prompt-library" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Prompt Library
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="text-xs">{prompt.category}</Badge>
            {prompt.featured && (
              <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                <Star className="w-3 h-3 fill-primary" /> Featured
              </span>
            )}
          </div>

          <h1 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-4">{prompt.title}</h1>
          {prompt.description && (
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">{prompt.description}</p>
          )}

          {prompt.imageUrl && (
            <div className="rounded-2xl overflow-hidden border border-border mb-10">
              <img src={prompt.imageUrl} alt={prompt.title} className="w-full object-cover" />
            </div>
          )}

          {prompt.guide && (
            <div className="prose prose-invert prose-sm md:prose-base max-w-none mb-10 prose-headings:font-sora prose-a:text-primary">
              <ReactMarkdown>{prompt.guide}</ReactMarkdown>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card/70 overflow-hidden">
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
      </article>
    </>
  );
}