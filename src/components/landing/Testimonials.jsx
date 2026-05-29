import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const audience = [
  { tag: "Base44 Builders", line: "Plan your entities, roles, pages, permissions, and prompts before burning credits." },
  { tag: "Vibe Coders", line: "Turn your rough idea into a structured build plan AI can actually follow." },
  { tag: "Founders", line: "Validate your app structure before spending time or money building the wrong thing." },
  { tag: "Agencies", line: "Create client-ready app plans, scopes, and build prompts in minutes instead of days." },
  { tag: "Freelancers", line: "Look more professional, quote better, and build with fewer revisions." },
];

const quotes = [
  {
    quote: "I stopped asking Base44 to guess what I wanted. Now I give it structured prompts from Kode Architect and the builds are cleaner from the start.",
    name: "Marcus T.",
    role: "Base44 Builder",
  },
  {
    quote: "The permission planning alone saved me from shipping an app that exposed customer data.",
    name: "Priya R.",
    role: "Startup Founder",
  },
  {
    quote: "I used to waste credits fixing the same bugs over and over. Now I architect first, then build.",
    name: "Devon K.",
    role: "Agency Owner",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-14"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-widest">Built For</span>
          <h2 className="font-sora font-bold text-3xl md:text-5xl tracking-tight mt-4">
            Built for people using AI to build real software
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-16">
          {audience.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="rounded-xl border border-border bg-card/60 p-5 text-center"
            >
              <h3 className="font-sora font-bold text-sm text-primary mb-2">{a.tag}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{a.line}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quotes.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-card/70 p-7"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground leading-relaxed mb-6">"{q.quote}"</p>
              <div>
                <p className="font-sora font-semibold text-sm">{q.name}</p>
                <p className="text-xs text-muted-foreground">{q.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}