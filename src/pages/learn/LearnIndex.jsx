import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Video, Sparkles, Library, Settings2, ShieldCheck, Bot, GraduationCap } from "lucide-react";
import Seo from "@/components/seo/Seo";
import { SITE, canonical } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";

const SECTIONS = [
  {
    label: "Base44 Master Class",
    to: "/learn/base44-master-class",
    icon: GraduationCap,
    desc: "Live 20-week academy — plan, build, test, secure, launch, market, and sell real apps with Base44 and Claude. Starts Aug 10, 2026. $99 per seat, 100 seats only.",
    badge: "NEW",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/709424cb6_generated_image.png",
  },
  {
    label: "Base44 Cheat Sheets",
    to: "/learn/base44-cheat-sheet",
    icon: BookOpen,
    desc: "The complete Base44 resource hub — 40+ cheat sheets covering entities, auth, backend functions, AI agents, connectors, and every platform gotcha.",
    badge: "NEW",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/fbe04bf89_generated_image.png",
  },
  {
    label: "Blog",
    to: "/learn/blog",
    icon: BookOpen,
    desc: "Articles, tutorials, and deep dives on building production-grade apps with Base44 — from data models to launch.",
    badge: "UPDATED",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/d429220f7_generated_image.png",
  },
  {
    label: "Videos",
    to: "/learn/videos",
    icon: Video,
    desc: "Walkthroughs, demos, and step-by-step video guides for mastering the Base44 platform.",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/bbf0b54fa_generated_image.png",
  },
  {
    label: "Agent Skills",
    to: "/learn/agent-skills",
    icon: Sparkles,
    desc: "Expert playbooks the AI uses on demand — skill-driven automation for every part of your build.",
    badge: "NEW",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/1db2354a6_generated_image.png",
  },
  {
    label: "Prompt Library",
    to: "/learn/prompt-library",
    icon: Library,
    desc: "A growing collection of expert-crafted prompts by Will Kode, organized by category and use case.",
    badge: "NEW",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/e76703f7b_generated_image.png",
  },
  {
    label: "AI LLM Guide",
    to: "/learn/llm-guide",
    icon: Settings2,
    desc: "Compare AI models side-by-side and pick the right one for each task in your build workflow.",
    badge: "NEW",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/22b4cf4a6_generated_image.png",
  },
  {
    label: "AI Controls",
    to: "/learn/ai-controls",
    icon: ShieldCheck,
    desc: "Free prompts and guardrails to keep your AI builds on track, secure, and production-ready.",
    badge: "NEW",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/c0a77e76e_generated_image.png",
  },
  {
    label: "SuperAgent Explained",
    to: "/learn/superagent",
    icon: Bot,
    desc: "Understand the Base44 AI Agent — its capabilities, boundaries, security model, and automation patterns.",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/8efa469df_generated_image.png",
  },
];

export default function LearnIndex() {
  useEffect(() => {
    trackEvent("view_learn_directory", { section_count: SECTIONS.length });
  }, []);

  const handleClick = (label) =>
    trackEvent("learn_directory_click", { section_label: label, page_path: window.location.pathname });

  return (
    <>
      <Seo
        title="Learn Base44 — Tutorials, Prompts & Guides | KodeBase"
        description="Your central hub for mastering Base44 — browse tutorials, video walkthroughs, expert prompt libraries, agent skills, AI model guides, and automation playbooks."
        path="/learn"
        image="https://media.base44.com/images/public/6a1905a0bc76553d6c934574/40fe66e3e_generated_image.png"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "KodeBase Learn",
          url: canonical("/learn"),
          description:
            "Your central hub for mastering Base44 — browse tutorials, video walkthroughs, expert prompt libraries, agent skills, AI model guides, and automation playbooks.",
          publisher: { "@type": "Organization", name: SITE.name, logo: SITE.logo },
          hasPart: SECTIONS.map((s) => ({
            "@type": "WebPage",
            name: s.label,
            url: canonical(s.to),
            description: s.desc,
          })),
        }}
      />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-30" />
        <div className="relative max-w-6xl mx-auto px-6 py-28">
          {/* Hero */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-7 glow-orange">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-sora font-extrabold text-4xl md:text-5xl tracking-tight mb-5">
              <span className="text-gradient-orange">Learn</span> Base44
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Your central hub for mastering the platform — tutorials, video walkthroughs, expert prompt
              libraries, agent skills, AI model guides, and automation playbooks. Everything you need to
              build faster and ship with confidence.
            </p>
          </div>

          {/* Directory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SECTIONS.map((s, i) => (
              <motion.div
                key={s.to}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
              >
                <Link
                  to={s.to}
                  onClick={() => handleClick(s.label)}
                  className="group block h-full overflow-hidden rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <div className="relative aspect-[16/10] overflow-hidden border-b border-border">
                    <img
                      src={s.image}
                      alt={`${s.label} featured`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {s.badge && (
                      <span className="absolute top-3 right-3 inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold leading-none bg-primary text-primary-foreground shadow-lg">
                        {s.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <s.icon className="w-4 h-4" />
                      </span>
                      <h3 className="font-sora font-semibold text-lg group-hover:text-primary transition-colors">
                        {s.label}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{s.desc}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                      Explore
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}