import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, DraftingCompass, Wand2 } from "lucide-react";
import { trackCTA } from "@/lib/analytics";

// Home "Tools" section — surfaces the app's builder tools (App Blueprint, Prompt Engine).
// Matches the Workspace card pattern: full-bleed AI image top + card gradient overlay.
const TOOLS = [
  {
    icon: Wand2,
    title: "Prompt Engine",
    badge: "NEW",
    to: "/tools/prompt-generator",
    desc: "Turn your idea into an ordered prompt pack — every prompt you need to build, in the right sequence. Copy, paste, build.",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/defc7d256_generated_image.png",
  },
];

export default function ToolsSection() {
  return (
    <section id="tools" className="relative py-24 scroll-mt-20">
      <div className="absolute inset-0 blueprint-grid opacity-30" />
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-widest">Builder Tools</span>
          <h2 className="font-sora font-bold text-3xl md:text-5xl tracking-tight mt-4 mb-5">
            Plan and prompt with <span className="text-gradient-orange">purpose-built tools</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Go from idea to architecture to copy-paste build prompts — without guessing what to ask.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {TOOLS.map((t, i) => (
            <motion.div
              key={t.to}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                to={t.to}
                onClick={() => trackCTA({ text: t.title, location: "home_tools", destination: t.to })}
                className="group block h-full overflow-hidden rounded-2xl border border-border bg-card/70 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-44 overflow-hidden">
                  <img src={t.image} alt={t.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/95 via-card/30 to-transparent" />
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-primary text-primary-foreground">
                    {t.badge}
                  </span>
                </div>
                <div className="p-7">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-105 transition-all duration-300">
                      <t.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-sora font-bold text-xl mb-2">{t.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{t.desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all">
                    Open tool <ArrowRight className="w-4 h-4" />
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