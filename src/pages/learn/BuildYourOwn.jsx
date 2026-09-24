import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Hammer, Search, ExternalLink, PlayCircle, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Seo from "@/components/seo/Seo";
import { canonical } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import LoadingState from "@/components/shared/LoadingState";

const SOURCE_REPO = "https://github.com/codecrafters-io/build-your-own-x";
const DESCRIPTION =
  "Step-by-step guides for re-creating the technologies you use every day — databases, Git, Docker, shells, compilers, web servers and more — from scratch.";

// Featured first, then alphabetical.
const byFeaturedThenTitle = (a, b) =>
  (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.title.localeCompare(b.title);

// Alphabetical, with the catch-all bucket last.
const byCategoryName = (a, b) =>
  (a === "Uncategorized") - (b === "Uncategorized") || a.localeCompare(b);

function TutorialRow({ t }) {
  return (
    <a
      href={t.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent("build_your_own_click", { tutorial_title: t.title, category: t.category })}
      className="group flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4 hover:border-primary/40 hover:bg-card transition-colors"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
          {(t.languages || []).map((l) => (
            <Badge key={l} variant="secondary" className="text-[11px] font-mono">{l}</Badge>
          ))}
          {t.isVideo && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
              <PlayCircle className="w-3.5 h-3.5" /> Video
            </span>
          )}
          {t.featured && <Star className="w-3.5 h-3.5 fill-primary text-primary" />}
        </div>
        <p className="font-medium leading-snug group-hover:text-primary transition-colors">{t.title}</p>
        {t.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.description}</p>}
      </div>
      <ExternalLink className="w-4 h-4 mt-1 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
    </a>
  );
}

export default function BuildYourOwn() {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [language, setLanguage] = useState("All");

  useEffect(() => {
    base44.entities.BuildTutorial.filter({ published: true }, "title", 2000)
      .then((d) => setTutorials(d || []))
      .catch(() => setTutorials([]))
      .finally(() => setLoading(false));
  }, []);

  const categoryCounts = useMemo(() => {
    const counts = {};
    tutorials.forEach((t) => { counts[t.category] = (counts[t.category] || 0) + 1; });
    return counts;
  }, [tutorials]);
  const categories = useMemo(() => Object.keys(categoryCounts).sort(byCategoryName), [categoryCounts]);

  const languages = useMemo(() => {
    const counts = {};
    tutorials.forEach((t) => (t.languages || []).forEach((l) => { counts[l] = (counts[l] || 0) + 1; }));
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));
  }, [tutorials]);

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matches = tutorials.filter((t) =>
      (category === "All" || t.category === category) &&
      (language === "All" || (t.languages || []).includes(language)) &&
      (!q || [t.title, t.category, t.description, ...(t.languages || [])]
        .some((v) => String(v || "").toLowerCase().includes(q)))
    );
    const byCat = {};
    matches.forEach((t) => { (byCat[t.category] ||= []).push(t); });
    return Object.keys(byCat).sort(byCategoryName).map((c) => ({ name: c, items: byCat[c].sort(byFeaturedThenTitle) }));
  }, [tutorials, search, category, language]);

  const shown = groups.reduce((n, g) => n + g.items.length, 0);
  const filtering = search.trim() || category !== "All" || language !== "All";

  return (
    <>
      <Seo
        title="Build Your Own X — Recreate Technologies From Scratch | KodeBase"
        description={DESCRIPTION}
        path="/learn/build-your-own"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Build Your Own",
          url: canonical("/learn/build-your-own"),
          description: DESCRIPTION,
        }}
      />

      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-30" />
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-7">
              <Hammer className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-sora font-extrabold text-4xl md:text-5xl tracking-tight mb-5">
              Build <span className="text-gradient-orange">Your Own</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">{DESCRIPTION}</p>
            {tutorials.length > 0 && (
              <p className="mt-4 text-sm text-muted-foreground">
                {tutorials.length.toLocaleString()} guides across {categories.length} categories
              </p>
            )}
          </motion.div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        {loading ? (
          <LoadingState label="Loading guides..." />
        ) : tutorials.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-border">
            <p className="font-sora font-semibold text-lg mb-2">Guides are on their way</p>
            <p className="text-muted-foreground">We're adding hundreds of build-it-yourself tutorials. Check back soon.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search guides — e.g. database, git, rust..."
                  className="pl-9"
                />
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All languages</SelectItem>
                  {languages.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2 mb-10">
              {["All", ...categories].map((c) => (
                <Button
                  key={c}
                  onClick={() => setCategory(c)}
                  variant={category === c ? "default" : "outline"}
                  size="sm"
                  className="font-medium"
                >
                  {c}
                  <span className="ml-1.5 text-xs opacity-70">{c === "All" ? tutorials.length : categoryCounts[c]}</span>
                </Button>
              ))}
            </div>

            {filtering && (
              <p className="text-sm text-muted-foreground mb-6">
                {shown.toLocaleString()} {shown === 1 ? "guide" : "guides"} found
              </p>
            )}

            {groups.length === 0 ? (
              <div className="text-center text-muted-foreground py-16">No guides match those filters.</div>
            ) : (
              <div className="space-y-12">
                {groups.map((g) => (
                  <div key={g.name}>
                    <h2 className="font-sora font-bold text-xl mb-4 flex items-center gap-2">
                      <span className="w-1 h-5 rounded-full bg-gradient-to-b from-[#f87171] via-[#fb923c] to-[#facc15]" />
                      {g.name === "Uncategorized" ? "More builds" : <>Build your own <span className="text-primary">{g.name}</span></>}
                      <span className="text-sm font-normal text-muted-foreground">({g.items.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {g.items.map((t) => <TutorialRow key={t.id} t={t} />)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <p className="mt-16 text-center text-xs text-muted-foreground">
          Many guides are curated from{" "}
          <a href={SOURCE_REPO} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
            build-your-own-x
          </a>{" "}
          by CodeCrafters and its contributors (CC0). Tutorials are hosted by their original authors.
        </p>
      </section>
    </>
  );
}
