import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Seo from "@/components/seo/Seo";
import AiControlPromptCard from "@/components/learn/AiControlPromptCard";
import { AI_CONTROL_PROMPTS } from "@/components/learn/aiControlPrompts";
import { trackEvent } from "@/lib/analytics";

const OG_IMAGE = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/afd514d60_generated_image.png";

export default function AiControls() {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  useEffect(() => {
    trackEvent("view_ai_controls", { page_path: "/learn/ai-controls" });
  }, []);

  const categories = ["all", ...Array.from(new Set(AI_CONTROL_PROMPTS.map((p) => p.category)))];
  const filtered = AI_CONTROL_PROMPTS.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.prompt.toLowerCase().includes(q);
    const matchCat = filterCat === "all" || p.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="AI Controls — Free Prompts to Stop AI Drift & Keep Builds on Track | KodeBase"
        description="12 free copy-paste AI control prompts: scope locks, regression checklists, permission guards, and drift control rules that keep AI app builders from breaking your app."
        path="/learn/ai-controls"
        type="website"
        image={OG_IMAGE}
      />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-12 px-6">
        <div className="absolute inset-0 blueprint-grid opacity-30" />
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-7">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-sora font-extrabold text-4xl md:text-5xl tracking-tight mb-5">
              AI <span className="text-gradient-orange">Controls</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Free copy-paste control prompts that keep AI builders on track — stop drift, prevent duplicates, protect your data, and force clean change reports. Use them with any AI app builder.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 mt-7">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-semibold text-gradient-orange">{AI_CONTROL_PROMPTS.length}</span>
              <span className="text-sm text-muted-foreground">free control prompts</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search prompts…" className="pl-9" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilterCat(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                    filterCat === c
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {c === "all" ? "All" : c}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No prompts match your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((p) => <AiControlPromptCard key={p.id} item={p} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}