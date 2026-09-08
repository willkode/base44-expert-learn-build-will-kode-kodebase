import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { setupSteps } from "./kodeMailData";
import KodeMailSectionHeading from "./KodeMailSectionHeading";

export default function KodeMailSetup() {
  return (
    <section className="py-16 sm:py-24">
      <KodeMailSectionHeading
        eyebrow="Process"
        title="How it works"
        subtitle="Prompts in the right order, then a guided Cloudflare setup. No guessing at mail-server settings."
      />

      <ol className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div
          aria-hidden="true"
          className="hidden lg:block absolute left-0 right-0 top-12 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent"
        />
        {setupSteps.map((step, i) => (
          <motion.li
            key={step.num}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className="relative rounded-2xl border border-border bg-card/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 font-sora font-extrabold text-lg text-gradient-orange">
              {step.num}
            </span>
            <p className="font-sora font-semibold text-base mt-4">{step.title}</p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">{step.desc}</p>
          </motion.li>
        ))}
      </ol>

      <div className="mt-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 sm:p-7 flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Sparkles className="w-5 h-5" />
        </span>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Includes an AI assistant prompt.</span> One of the prompts
          builds an in-app assistant for your inbox — it creates new addresses, checks your email configuration,
          diagnoses delivery problems, and repairs supported settings with your approval.
        </p>
      </div>
    </section>
  );
}