import React from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { stacks } from "./migrationData";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function MigrationStacks() {
  return (
    <section className="py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Technology options</p>
          <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">The right stack for your app.</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">We recommend the technology stack based on the complexity, scale, budget, and ownership requirements of the application.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {stacks.map((stack) => (
            <motion.div
              key={stack.title}
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="rounded-2xl border border-border bg-card/60 p-6 flex flex-col"
            >
              <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">{stack.subtitle}</span>
              <h3 className="font-sora font-bold text-xl mb-2">{stack.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{stack.desc}</p>
              <ul className="space-y-2">
                {stack.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}