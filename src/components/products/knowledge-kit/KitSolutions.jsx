import React from "react";
import { motion } from "framer-motion";

const SOLUTIONS = [
  {
    label: "Structured Blueprints",
    desc: "Turns vague ideas into entity schemas, role matrices, and page-by-page requirements — the difference between \"good idea\" and \"ready to build.\"",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/419cb0a16_generated_image.png",
  },
  {
    label: "Precision Prompts",
    desc: "Replaces one giant prompt with focused, sequenced build steps. Each prompt gives the AI agent a narrow, actionable task that's easy to inspect and refine.",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/d8b16ff96_generated_image.png",
  },
  {
    label: "Iterative Building",
    desc: "Build in layers — data model first, roles next, then screens, then workflows. Validate each step before adding complexity. No more one-shot gambles.",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/8198425a3_generated_image.png",
  },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function KitSolutions() {
  return (
    <div className="max-w-5xl mx-auto mt-24">
      <div className="text-center mb-10">
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">How It Works</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-4">
          The kit gives AI <span className="text-gradient-orange">Base44 fluency</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Instead of guessing how Base44 works, your AI model gets structured, platform-specific context.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SOLUTIONS.map(({ label, desc, image }, i) => (
          <motion.div
            key={label}
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            transition={{ duration: 0.35, delay: i * 0.12 }}
            className="flex flex-col rounded-2xl border border-border bg-card/60 hover:border-primary/40 transition-colors overflow-hidden group"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img src={image} alt={label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-sm text-foreground mb-2">{label}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}