import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Library, Lock } from "lucide-react";
import { trackCTA } from "@/lib/analytics";

// Home "Prompts" section — the prompt ecosystem: free library, ordered engine, and the curated vault.
const PROMPTS = [
  {
    icon: Library,
    title: "Prompt Library",
    badge: "Free",
    to: "/learn/prompt-library",
    desc: "Browse expert prompts by Will Kode across development, business, SEO, marketing, and AI — copy-paste ready.",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/5685cb3d6_generated_image.png",
  },
  {
    icon: Lock,
    title: "Prompt Vault",
    badge: "Pro",
    to: "/vault",
    desc: "200+ curated, hand-picked prompts with recommended models — searchable, filterable, and updated regularly.",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/445de1ec7_generated_image.png",
  },
];

export default function PromptsSection() {
  return (
    <section id="prompts" className="relative py-24 scroll-mt-20 overflow-hidden">
      <div className="absolute inset-0 blueprint-grid opacity-20" />
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-widest">Prompts</span>
          <h2 className="font-sora font-bold text-3xl md:text-5xl tracking-tight mt-4 mb-5">
            The complete <span className="text-gradient-orange">prompt ecosystem</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From a free library to ordered build packs and a curated vault — the right prompt for every step.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {PROMPTS.map((p, i) => (
            <motion.div
              key={p.to}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                to={p.to}
                onClick={() => trackCTA({ text: p.title, location: "home_prompts", destination: p.to })}
                className="group block h-full overflow-hidden rounded-2xl border border-border bg-card/70 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-36 overflow-hidden">
                  <img src={p.image} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/95 via-card/30 to-transparent" />
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-background/70 border border-white/10 text-white/80 backdrop-blur-sm">
                    {p.badge}
                  </span>
                </div>
                <div className="p-7 pt-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-105 transition-all duration-300">
                      <p.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-sora font-bold text-lg mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{p.desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all">
                    Explore <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}