import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Hammer, Search, ExternalLink, PlayCircle, Star, Lock, Check, PartyPopper } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Seo from "@/components/seo/Seo";
import { canonical } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";
import { formatUsd } from "@/lib/summerSale";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import LoadingState from "@/components/shared/LoadingState";

const PAGE_PATH = "/learn/build-your-own";
const DESCRIPTION =
  "Step-by-step guides for re-creating the technologies you use every day — databases, Git, Docker, shells, compilers, web servers and more — from scratch.";

// Featured first, then alphabetical.
const byFeaturedThenTitle = (a, b) =>
  (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.title.localeCompare(b.title);

// Alphabetical, with the catch-all bucket last.
const byCategoryName = (a, b) =>
  (a === "Uncategorized") - (b === "Uncategorized") || a.localeCompare(b);

const groupHeading = (name) =>
  name === "Uncategorized" ? "More builds" : <>Build your own <span className="text-primary">{name}</span></>;

function GroupTitle({ name, count }) {
  return (
    <h2 className="font-sora font-bold text-xl mb-4 flex items-center gap-2">
      <span className="w-1 h-5 rounded-full bg-gradient-to-b from-[#f87171] via-[#fb923c] to-[#facc15]" />
      {groupHeading(name)}
      <span className="text-sm font-normal text-muted-foreground">({count})</span>
    </h2>
  );
}

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

// Full library — only rendered for buyers and admins.
function Library({ tutorials }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [language, setLanguage] = useState("All");

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

  if (tutorials.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl border border-dashed border-border">
        <p className="font-sora font-semibold text-lg mb-2">Guides are on their way</p>
        <p className="text-muted-foreground">We're adding hundreds of build-it-yourself tutorials. Check back soon.</p>
      </div>
    );
  }

  return (
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
              <GroupTitle name={g.name} count={g.items.length} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {g.items.map((t) => <TutorialRow key={t.id} t={t} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// Locked view — pricing card plus a link-free preview of what's inside.
function Paywall({ data }) {
  const navigate = useNavigate();
  const price = formatUsd(data.product?.priceCents ?? 500);
  const categories = [...(data.categories || [])].sort((a, b) => byCategoryName(a.name, b.name));
  const canBuy = data.total > 0 && data.product?.active;

  const unlock = () => {
    trackEvent("build_your_own_unlock_click", { signed_in: data.signedIn });
    if (!data.signedIn) { navigate(`/register?next=${PAGE_PATH}`); return; }
    navigate(`/checkout?product=${data.product.id}`);
  };

  return (
    <>
      <div className="max-w-xl mx-auto mb-16 rounded-2xl border border-primary/40 bg-card/80 p-8 text-center glow-orange">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs font-medium text-primary mb-5">
          <Lock className="w-3.5 h-3.5" /> Members only
        </div>
        <p className="font-sora font-extrabold text-5xl mb-1">{price}</p>
        <p className="text-muted-foreground mb-6">One-time payment · Lifetime access · No subscription</p>
        <ul className="text-sm text-left space-y-2 max-w-sm mx-auto mb-7">
          {[
            data.total > 0 ? `${data.total.toLocaleString()} curated guides across ${categories.length} categories` : "Hundreds of curated guides",
            "Search and filter by category and programming language",
            "New guides added over time — included forever",
          ].map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Check className="w-4 h-4 mt-0.5 shrink-0 text-primary" /> {f}
            </li>
          ))}
        </ul>
        {canBuy ? (
          <Button
            onClick={unlock}
            size="lg"
            className="w-full font-semibold bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90"
          >
            Unlock for {price}
          </Button>
        ) : (
          <Button size="lg" className="w-full" disabled>Opening soon</Button>
        )}
        <p className="mt-3 text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3" /> Secure checkout via Square
        </p>
        {!data.signedIn && (
          <p className="mt-4 text-sm text-muted-foreground">
            Already purchased?{" "}
            <Link to={`/login?next=${PAGE_PATH}`} className="text-primary hover:underline">Log in</Link>
          </p>
        )}
      </div>

      {categories.length > 0 && (
        <>
          <h2 className="font-sora font-bold text-2xl text-center mb-2">What's inside</h2>
          <p className="text-center text-muted-foreground mb-8">A peek at every category — unlock to open the guides.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {categories.map((c) => (
              <div key={c.name} className="rounded-xl border border-border bg-card/60 p-5">
                <div className="flex items-baseline justify-between gap-3 mb-3">
                  <p className="font-sora font-semibold">{c.name === "Uncategorized" ? "More builds" : c.name}</p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{c.count} {c.count === 1 ? "guide" : "guides"}</span>
                </div>
                <ul className="space-y-1.5">
                  {c.samples.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Lock className="w-3 h-3 mt-1 shrink-0" />
                      <span className="line-clamp-1">{s}</span>
                    </li>
                  ))}
                  {c.count > c.samples.length && (
                    <li className="text-xs text-muted-foreground/70 pl-5">+ {c.count - c.samples.length} more</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
          {data.languages?.length > 0 && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">Languages covered</p>
              <div className="flex flex-wrap justify-center gap-1.5 max-w-3xl mx-auto">
                {data.languages.slice(0, 30).map((l) => (
                  <Badge key={l} variant="secondary" className="text-[11px] font-mono">{l}</Badge>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default function BuildYourOwn() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const justUnlocked = new URLSearchParams(window.location.search).get("unlocked") === "1";

  useEffect(() => {
    base44.functions.invoke("getBuildYourOwn", {})
      .then((res) => setData(res.data))
      .catch(() => setError(true));
  }, []);

  return (
    <>
      <Seo
        title="Build Your Own X — Recreate Technologies From Scratch | KodeBase"
        description={DESCRIPTION}
        path={PAGE_PATH}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Build Your Own",
          url: canonical(PAGE_PATH),
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
          </motion.div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        {error ? (
          <div className="text-center text-muted-foreground py-16">Couldn't load this page. Please refresh to try again.</div>
        ) : !data ? (
          <LoadingState label="Loading guides..." />
        ) : data.hasAccess ? (
          <>
            {justUnlocked && data.via === "purchase" && (
              <div className="mb-8 rounded-xl border border-primary/40 bg-primary/10 p-4 flex items-center gap-3 text-sm">
                <PartyPopper className="w-5 h-5 text-primary shrink-0" />
                You're in — lifetime access unlocked. Happy building!
              </div>
            )}
            <Library tutorials={data.tutorials || []} />
          </>
        ) : (
          <Paywall data={data} />
        )}
      </section>
    </>
  );
}
