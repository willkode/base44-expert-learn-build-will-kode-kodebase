import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const audience = [
  { tag: "Base44 Builders", line: "Finally structure entities, roles, and security the right way." },
  { tag: "Vibe Coders", line: "Describe your idea — get a real software plan, not guesswork." },
  { tag: "Founders", line: "Turn rough ideas into clean technical scope before spending a dime." },
  { tag: "Agencies", line: "Generate client-ready proposals and architecture docs in minutes." },
];

const quotes = [
  {
    quote: "I used to build apps that broke the moment real users showed up. Now I architect first — game changer.",
    name: "Marcus T.",
    role: "Indie Builder",
  },
  {
    quote: "The security model alone saved me from shipping an app with wide-open permissions. Worth it instantly.",
    name: "Priya R.",
    role: "Startup Founder",
  },
  {
    quote: "We use it for every client proposal now. Clean architecture docs in minutes instead of days.",
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
            Software architecture for everyone who builds
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
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