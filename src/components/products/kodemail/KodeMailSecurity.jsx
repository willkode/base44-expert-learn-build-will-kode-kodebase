import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Users, Check } from "lucide-react";
import { securityPoints, builtFor } from "./kodeMailData";

export default function KodeMailSecurity() {
  return (
    <section className="grid lg:grid-cols-2 gap-4 sm:gap-5 py-16 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl border border-border bg-card/50 p-7 sm:p-9"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary mb-5">
          <ShieldCheck className="w-6 h-6" />
        </span>
        <h2 className="font-sora font-bold text-2xl sm:text-[1.75rem] tracking-tight mb-5">
          Your mail, your control — nothing risky to switch
        </h2>
        <ul className="space-y-3.5">
          {securityPoints.map((p) => (
            <li key={p} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Check className="w-3 h-3" />
              </span>
              {p}
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        className="rounded-3xl border border-border bg-card/50 p-7 sm:p-9"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary mb-5">
          <Users className="w-6 h-6" />
        </span>
        <h2 className="font-sora font-bold text-2xl sm:text-[1.75rem] tracking-tight mb-3">
          Who this is for
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Anyone tired of a monthly bill for an inbox they'll never own.
        </p>
        <div className="flex flex-wrap gap-2">
          {builtFor.map((b) => (
            <span
              key={b}
              className="px-3.5 py-2 rounded-xl border border-border bg-background/50 text-xs font-medium transition-colors hover:border-primary/40 hover:text-primary"
            >
              {b}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}