import React from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { includedSections } from "./migrationData";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function MigrationIncluded() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 blueprint-grid opacity-10" />
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">What is included</p>
          <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">Every system, migrated properly.</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">From discovery to database, authentication, functions, storage, integrations, realtime, and automations.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {includedSections.map((section) => (
            <motion.div
              key={section.title}
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="rounded-2xl border border-border bg-card/60 overflow-hidden"
            >
              <img src={section.img} alt={section.title} loading="lazy" className="w-full aspect-[16/9] object-cover" />
              <div className="p-6">
              <h3 className="font-sora font-bold text-lg mb-2">{section.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{section.intro}</p>
              <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-2">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}