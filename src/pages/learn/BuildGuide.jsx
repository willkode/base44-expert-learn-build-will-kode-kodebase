import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, PlayCircle, Clock, Gauge, Hammer, Lock, PartyPopper } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Seo from "@/components/seo/Seo";
import { trackEvent } from "@/lib/analytics";
import { BUILD_PATH, youtubeEmbedUrl } from "@/lib/buildGuides";
import BlogContent from "@/components/learn/BlogContent";
import BuildUnlockCard from "@/components/learn/BuildUnlockCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingState from "@/components/shared/LoadingState";

function GuideMeta({ g }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs mb-5">
      <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
        {g.category === "Uncategorized" ? "Build Your Own" : g.category}
      </span>
      {g.languages.map((l) => <Badge key={l} variant="secondary" className="font-mono text-[11px]">{l}</Badge>)}
      {g.difficulty && (
        <span className="inline-flex items-center gap-1 text-muted-foreground"><Gauge className="w-3.5 h-3.5" /> {g.difficulty}</span>
      )}
      {g.timeEstimate && (
        <span className="inline-flex items-center gap-1 text-muted-foreground"><Clock className="w-3.5 h-3.5" /> {g.timeEstimate}</span>
      )}
      {g.isVideo && (
        <span className="inline-flex items-center gap-1 text-primary font-medium"><PlayCircle className="w-3.5 h-3.5" /> Video</span>
      )}
    </div>
  );
}

function SourceCredit({ g }) {
  const embed = g.isVideo && youtubeEmbedUrl(g.url);
  return (
    <div className="mt-12 rounded-2xl border border-border bg-card/60 p-6 md:p-8">
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Original guide</p>
      <p className="text-foreground/90 mb-5 leading-relaxed">
        This project is based on {g.isVideo ? "a video guide" : "a guide"} by{" "}
        <span className="font-semibold">{g.sourceName || "its original author"}</span>. All credit for the original
        walkthrough goes to its author — follow along there for the complete {g.isVideo ? "series" : "step-by-step code"}.
      </p>
      <Button asChild variant="outline" className="gap-2">
        <a
          href={g.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("build_guide_source_click", { tutorial_title: g.title, category: g.category })}
        >
          {embed ? "Watch on YouTube" : "Continue with the full guide"} <ExternalLink className="w-4 h-4" />
        </a>
      </Button>
    </div>
  );
}

export default function BuildGuide() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const path = `${BUILD_PATH}/${slug}`;

  useEffect(() => {
    setData(null);
    base44.functions.invoke("getBuildGuide", { slug })
      .then((res) => {
        setData(res.data);
        if (res.data?.guide) trackEvent("view_build_guide", { tutorial_title: res.data.guide.title, has_access: res.data.hasAccess });
      })
      .catch(() => setError(true));
  }, [slug]);

  if (error) {
    return <div className="pt-40 pb-24 text-center text-muted-foreground">Couldn't load this guide. Please refresh to try again.</div>;
  }
  if (!data) return <div className="pt-32 pb-24"><LoadingState label="Loading guide..." /></div>;

  if (data.notFound) {
    return (
      <div className="pt-40 pb-24 text-center max-w-xl mx-auto px-6">
        <Seo title="Guide not found | KodeBase" description="This guide could not be found." path={path} noindex />
        <h1 className="font-sora font-bold text-2xl mb-3">Guide not found</h1>
        <p className="text-muted-foreground mb-6">This guide may have been moved or removed.</p>
        <Button asChild><Link to={BUILD_PATH}>Back to Build Your Own</Link></Button>
      </div>
    );
  }

  const g = data.guide;
  const embed = data.hasAccess && g.isVideo ? youtubeEmbedUrl(g.url) : null;
  const justUnlocked = new URLSearchParams(window.location.search).get("unlocked") === "1";

  return (
    <>
      <Seo
        title={`${g.title} — Build Your Own | KodeBase`}
        description={g.description || `Build your own ${g.category} from scratch${g.languages.length ? ` in ${g.languages.join(", ")}` : ""}. A KodeBase Build Your Own guide.`}
        path={path}
        type="article"
      />

      <article className="relative">
        <div className="absolute inset-0 blueprint-grid opacity-20" />
        <div className="relative max-w-4xl mx-auto px-6 pt-28 pb-24">
          <Link to={BUILD_PATH} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-10">
            <ArrowLeft className="w-4 h-4" /> Back to Build Your Own
          </Link>

          <motion.header initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-10">
            <GuideMeta g={g} />
            <h1 className="font-sora font-extrabold text-3xl md:text-5xl tracking-tight leading-[1.1] mb-5">{g.title}</h1>
            {g.description && <p className="text-lg text-muted-foreground leading-relaxed">{g.description}</p>}
          </motion.header>

          {data.hasAccess ? (
            <>
              {justUnlocked && data.via === "purchase" && (
                <div className="mb-8 rounded-xl border border-primary/40 bg-primary/10 p-4 flex items-center gap-3 text-sm">
                  <PartyPopper className="w-5 h-5 text-primary shrink-0" />
                  You're in — lifetime access unlocked. Happy building!
                </div>
              )}

              {embed && (
                <div className="aspect-video rounded-2xl overflow-hidden border border-border bg-black mb-10">
                  <iframe
                    src={embed}
                    title={g.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              )}

              <div className="rounded-2xl border border-border bg-card/40 p-6 md:p-8">
                <h2 className="font-sora font-bold text-lg mb-2 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-gradient-to-b from-[#f87171] via-[#fb923c] to-[#facc15]" />
                  The KodeBase breakdown
                </h2>
                {g.writeup ? (
                  <BlogContent content={g.writeup} />
                ) : (
                  <p className="text-muted-foreground mt-4">
                    Our full breakdown for this build is on the way. In the meantime, jump into the original guide below.
                  </p>
                )}
              </div>

              <SourceCredit g={g} />
            </>
          ) : (
            <>
              <div className="relative rounded-2xl border border-border bg-card/40 p-6 md:p-8 mb-12 overflow-hidden" aria-hidden="true">
                <p className="font-sora font-bold text-lg mb-4 flex items-center gap-2">
                  <Hammer className="w-4 h-4 text-primary" /> The KodeBase breakdown
                </p>
                {["What you'll build", "Key concepts", "Before you start", "Roadmap", "Common pitfalls", "Take it further"].map((h) => (
                  <div key={h} className="mb-5">
                    <p className="font-sora font-semibold mb-2">{h}</p>
                    <div className="space-y-2 blur-[3px] select-none">
                      <div className="h-3 rounded bg-muted-foreground/20 w-full" />
                      <div className="h-3 rounded bg-muted-foreground/20 w-11/12" />
                      <div className="h-3 rounded bg-muted-foreground/20 w-4/6" />
                    </div>
                  </div>
                ))}
                <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-background via-background/70 to-transparent pb-8">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                    <Lock className="w-4 h-4" /> Unlock to read the full guide
                  </span>
                </div>
              </div>
              <BuildUnlockCard access={data} returnPath={path} />
            </>
          )}
        </div>
      </article>
    </>
  );
}
