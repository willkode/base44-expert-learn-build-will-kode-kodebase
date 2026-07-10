import React from "react";
import { motion } from "framer-motion";

const FAILURES = [
  {
    label: "Generic Technical Specs",
    desc: "Lists of database tables and API endpoints that don't become a Base44 build plan.",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/867c09b58_generated_image.png",
  },
  {
    label: "Hallucinated Platform Behavior",
    desc: "Invented commands and workflows that don't match how Base44 actually works.",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/bcd166093_generated_image.png",
  },
  {
    label: "Under-Specified Permissions",
    desc: "\"Implement role-based access control\" — correct in theory, useless in practice.",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/4118c9a63_generated_image.png",
  },
  {
    label: "Oversized & Vague Prompts",
    desc: "One giant prompt trying to build the entire app at once — impossible to control or debug.",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/6101dd363_generated_image.png",
  },
  {
    label: "Product Plan ≠ Build Plan",
    desc: "Personas and feature lists are not the same as entity schemas and copy-paste build prompts.",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/108c53843_generated_image.png",
  },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function KitFailures() {
  return (
    <div className="max-w-5xl mx-auto mt-24">
      <div className="text-center mb-10">
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">5 Failure Points</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-4">
          Where general AI <span className="text-gradient-orange">falls short</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          These aren't model limitations — they're context gaps. Here's what happens when AI doesn't understand Base44.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FAILURES.map(({ label, desc, image }, i) => (
          <motion.div
            key={label}
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            transition={{ duration: 0.35, delay: Math.min(i * 0.08, 0.4) }}
            className="flex items-stretch rounded-xl border border-border bg-card/60 hover:border-primary/40 transition-colors overflow-hidden group"
          >
            <div className="relative w-28 sm:w-32 shrink-0 overflow-hidden">
              <img src={image} alt={label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/80" />
            </div>
            <div className="flex flex-col justify-center p-4 flex-1">
              <p className="font-semibold text-sm text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}