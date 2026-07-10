import React from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function KitProblem() {
  return (
    <div className="max-w-5xl mx-auto mt-24">
      <motion.div
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row items-stretch rounded-2xl border border-border bg-card/60 overflow-hidden"
      >
        <div className="relative md:w-2/5 shrink-0 overflow-hidden min-h-[200px]">
          <img
            src="https://media.base44.com/images/public/6a1905a0bc76553d6c934574/108c53843_generated_image.png"
            alt="General AI vs Base44-aware AI"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-card via-card/30 to-transparent" />
        </div>
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <span className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">The Problem</span>
          <h3 className="font-sora font-bold text-xl md:text-2xl mb-4">
            General AI sounds confident — but it's not <span className="text-gradient-orange">build-ready.</span>
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            When you ask a non-Base44 AI model to plan your app, the output looks polished. But it doesn't map to
            Base44 entities, roles, or prompt patterns. You still have to translate every idea into platform-specific
            instructions.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            That translation step is where projects slow down — and where the Knowledge Kit changes everything.
          </p>
        </div>
      </motion.div>
    </div>
  );
}