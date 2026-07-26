import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, ClipboardList } from "lucide-react";
import { reviewNeeds } from "./migrationData";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function MigrationReadiness() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 blueprint-grid opacity-10" />
      <div className="relative max-w-3xl mx-auto px-6">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="rounded-2xl border border-border bg-card/60 p-8"
        >
          <ClipboardList className="w-8 h-8 text-primary mb-4" />
          <h3 className="font-sora font-bold text-xl mb-2">What we need to review your application</h3>
          <p className="text-sm text-muted-foreground mb-5">To prepare an accurate migration scope, we typically need the following. Repository access can remain read-only during the initial review.</p>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
            {reviewNeeds.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}