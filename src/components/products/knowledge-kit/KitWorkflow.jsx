import React from "react";
import { motion } from "framer-motion";

const STEPS = [
  "Describe your app idea and user types",
  "Generate a structured Base44 blueprint",
  "Review the data model and permissions",
  "Build the foundation with the first prompt",
  "Test the result",
  "Add screens and workflows in layers",
  "Use focused prompts for refinements",
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function KitWorkflow() {
  return (
    <div className="max-w-5xl mx-auto mt-24">
      <div className="flex flex-col md:flex-row items-stretch rounded-2xl border border-border bg-card/60 overflow-hidden">
        <div className="relative md:w-2/5 shrink-0 overflow-hidden min-h-[200px]">
          <img
            src="https://media.base44.com/images/public/6a1905a0bc76553d6c934574/8198425a3_generated_image.png"
            alt="Iterative building workflow"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-card via-card/30 to-transparent" />
        </div>
        <div className="p-8 md:p-10 flex-1">
          <span className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">The Right Workflow</span>
          <h3 className="font-sora font-bold text-xl md:text-2xl mb-6">
            Stop hoping. Start <span className="text-gradient-orange">building in layers.</span>
          </h3>
          <div className="space-y-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="flex items-center gap-3"
              >
                <span className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                </span>
                <p className="text-sm text-muted-foreground">{step}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}