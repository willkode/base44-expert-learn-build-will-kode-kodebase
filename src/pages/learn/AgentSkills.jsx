import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import Seo from "@/components/seo/Seo";
import LoadingState from "@/components/shared/LoadingState";
import AgentSkillCard from "@/components/learn/AgentSkillCard";
import SkillReviewPanel from "@/components/learn/SkillReviewPanel";
import ProductsCtaBanner from "@/components/shared/ProductsCtaBanner";
import { trackEvent } from "@/lib/analytics";

const OG_IMAGE = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/b1ec637c7_generated_image.png";

export default function AgentSkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [isAdmin, setIsAdmin] = useState(false);

  const loadSkills = () =>
    base44.entities.AgentSkill.filter({ published: true }, "order", 200)
      .then(setSkills)
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => {
    trackEvent("view_agent_skills", { page_path: "/learn/agent-skills" });
    loadSkills();
    base44.auth.me().then((u) => setIsAdmin(u?.role === "admin")).catch(() => setIsAdmin(false));
  }, []);

  const categories = ["all", ...Array.from(new Set(skills.map((s) => s.category).filter(Boolean)))];
  const filtered = skills.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.title.toLowerCase().includes(q) || (s.description || "").toLowerCase().includes(q) || (s.tags || []).some((t) => t.toLowerCase().includes(q));
    const matchCat = filterCat === "all" || s.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Agent Skills — Reusable AI Agent Prompts for Base44 | KodeBase"
        description="Browse a growing library of reusable agent skills — copy-paste build prompts with the recommended AI model to make your Base44 agents smarter and more reliable."
        path="/learn/agent-skills"
        type="website"
        image={OG_IMAGE}
      />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-12 px-6">
        <div className="absolute inset-0 blueprint-grid opacity-30" />
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-7">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-sora font-extrabold text-4xl md:text-5xl tracking-tight mb-5">
              Agent <span className="text-gradient-orange">Skills</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Reusable skills and capabilities to make your AI agents smarter and more reliable. Copy a build prompt, drop in the recommended model, and ship.
            </p>
            {!loading && skills.length > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 mt-7">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-sm font-semibold text-gradient-orange">{skills.length}</span>
                <span className="text-sm text-muted-foreground">skill{skills.length !== 1 ? "s" : ""} and counting</span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          {isAdmin && (
            <SkillReviewPanel existingTitles={skills.map((s) => s.title)} onChanged={loadSkills} />
          )}
          {loading ? (
            <LoadingState label="Loading agent skills…" />
          ) : skills.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No skills published yet — check back soon.</p>
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search skills…" className="pl-9" />
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
                  <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No skills match your search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.map((s) => <AgentSkillCard key={s.id} skill={s} />)}
                </div>
              )}

              <div className="mt-14">
                <ProductsCtaBanner
                  location="agent_skills"
                  title="Want the complete systems?"
                  description="These skills are free — our products give you full prompt packs and systems to build smarter agents and apps."
                />
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}