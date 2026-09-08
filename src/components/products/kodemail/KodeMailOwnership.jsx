import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { KODEMAIL_PRICE } from "./kodeMailData";
import KodeMailSectionHeading from "./KodeMailSectionHeading";

const subscriptionCons = [
  "$6–$22 per user, every single month",
  "Costs multiply with every new address you add",
  "Price increases you have no control over",
  "Stop paying and you lose your business email",
  "Years of payments for the same simple inbox",
];

const ownPros = [
  "One payment for the full prompt pack — no monthly bill",
  "You build and own the inbox system yourself",
  "Create as many addresses as you want, at no extra cost",
  "Step-by-step Cloudflare routing instructions included",
  `Pays for itself in under a month at $${KODEMAIL_PRICE}`,
];

export default function KodeMailOwnership() {
  return (
    <section className="py-16 sm:py-24">
      <KodeMailSectionHeading
        eyebrow="Rent vs. own"
        title="Rent your email, or own it"
        subtitle="A team of five on Google Workspace pays roughly $420 a year — every year. KodeMail is a one-time payment for the prompts and instructions to build the same professional email yourself."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-border bg-card/30 p-7 sm:p-8"
        >
          <h3 className="font-sora font-semibold text-lg text-muted-foreground mb-6">
            Google Workspace, Microsoft 365 &amp; co.
          </h3>
          <ul className="space-y-3.5">
            {subscriptionCons.map((c) => (
              <li key={c} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground/80">
                  <X className="w-3 h-3" />
                </span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="relative rounded-3xl border border-primary/30 bg-gradient-to-b from-primary/10 to-primary/[0.03] p-7 sm:p-8 shadow-xl shadow-primary/5"
        >
          <h3 className="font-sora font-semibold text-lg mb-6">
            <span className="text-gradient-orange">KodeMail — pay once, own it</span>
          </h3>
          <ul className="space-y-3.5">
            {ownPros.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm leading-relaxed">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <Check className="w-3 h-3" />
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}