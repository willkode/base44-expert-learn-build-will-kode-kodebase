import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { KODEMAIL_PRICE } from "./kodeMailData";
import KodeMailSectionHeading from "./KodeMailSectionHeading";

const subscriptionCons = [
  "$6–$22 per user, every month, forever",
  "Every new address raises your bill",
  "Price hikes you have no say in",
  "Miss a payment and you lose your business email",
  "Years of rent, and you still own nothing",
];

const ownPros = [
  "One payment — no monthly bill to renew",
  "You build and own the inbox system yourself",
  "Add as many addresses as you want, free",
  "Cloudflare routing spelled out step by step",
  `Cheaper than one month of Workspace, at $${KODEMAIL_PRICE}`,
];

export default function KodeMailOwnership() {
  return (
    <section className="py-16 sm:py-24">
      <KodeMailSectionHeading
        eyebrow="Rent vs. own"
        title="You're renting your email. That's why it never stops costing you."
        subtitle="Five people on Google Workspace is roughly $420 a year — and next year you pay it again. KodeMail is one payment for the prompts and instructions to build the same professional email yourself, then keep it."
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
            Renting: Google Workspace, Microsoft 365 &amp; co.
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
            <span className="text-gradient-orange">Owning: KodeMail — pay once, keep it</span>
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