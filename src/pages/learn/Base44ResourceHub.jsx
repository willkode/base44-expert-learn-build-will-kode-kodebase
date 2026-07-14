import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BookOpenCheck, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Seo from "@/components/seo/Seo";
import { SITE, canonical } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";
import useBase44Docs from "@/components/learn/base44/useBase44Docs";
import HubSidebar from "@/components/learn/base44/HubSidebar";
import HubTopicGrid from "@/components/learn/base44/HubTopicGrid";
import HubMarkdown from "@/components/learn/base44/HubMarkdown";

const OG_IMAGE = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/fbe04bf89_generated_image.png";

export default function Base44ResourceHub() {
  const { sections, loading, error } = useBase44Docs();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const activeSlug = searchParams.get("topic");
  const active = sections.find((s) => s.slug === activeSlug) || null;

  useEffect(() => {
    trackEvent("page_view", { page: "base44_resource_hub" });
  }, []);

  const handleSelect = (section) => {
    setSearchParams({ topic: section.slug });
    trackEvent("base44_hub_topic_view", { topic: section.slug });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => setSearchParams({});

  return (
    <>
      <Seo
        title={active ? `${active.title} — Base44 Cheat Sheets | KodeBase` : "Base44 Cheat Sheets — The Complete Platform Resource Hub | KodeBase"}
        description={
          active
            ? `Base44 cheat sheet: ${active.title}. Exact rules, SDK snippets, and gotchas so you build better Base44 apps faster.`
            : "Master every detail of Base44 — 40+ cheat sheets covering entities, auth, backend functions, AI agents, connectors, workflows, styling, deployment, and the gotchas that break builds."
        }
        path="/learn/base44"
        image={OG_IMAGE}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Base44 Cheat Sheets",
          url: canonical("/learn/base44"),
          description:
            "The complete Base44 platform resource hub — cheat sheets for entities, auth, backend functions, AI agents, connectors, workflows, styling, and deployment.",
          publisher: { "@type": "Organization", name: SITE.name, logo: SITE.logo },
        }}
      />

      {/* Hero */}
      <section className="relative pt-28 pb-12 overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-5">
            <BookOpenCheck className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Base44 Resource Hub</span>
          </div>
          <h1 className="font-sora font-extrabold text-4xl md:text-5xl tracking-tight mb-4">
            The <span className="text-gradient-orange">Base44 Cheat Sheets</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every detail of the Base44 platform in one place — SDK references, entity rules, backend
            function patterns, AI agents, connectors, and the gotchas that break builds. Learn the
            platform inside-out and develop better applications.
          </p>
        </div>
      </section>

      {/* Library */}
      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-6">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading the knowledge base...
            </div>
          )}
          {error && (
            <p className="text-center text-destructive py-24">Couldn't load the resource library. Please refresh and try again.</p>
          )}
          {!loading && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
              <aside className="lg:col-span-1 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-2">
                <HubSidebar
                  sections={sections}
                  query={query}
                  onQuery={setQuery}
                  activeSlug={activeSlug}
                  onSelect={handleSelect}
                />
              </aside>
              <main className="lg:col-span-3 min-w-0">
                {active ? (
                  <div>
                    <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4 -ml-2 text-muted-foreground">
                      <ArrowLeft className="w-4 h-4 mr-1" /> All topics
                    </Button>
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{active.category}</p>
                    <h2 className="font-sora font-extrabold text-3xl tracking-tight mb-2">{active.title}</h2>
                    <div className="h-1 w-16 rounded-full bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] mb-6" />
                    <HubMarkdown content={active.body} />
                  </div>
                ) : (
                  <HubTopicGrid sections={sections} onSelect={handleSelect} />
                )}
              </main>
            </div>
          )}
        </div>
      </section>
    </>
  );
}