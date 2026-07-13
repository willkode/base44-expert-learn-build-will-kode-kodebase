import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, ClipboardList, SearchCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reviewNeeds, readinessItems } from "./migrationData";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function MigrationReadiness({ onCTA }) {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 blueprint-grid opacity-10" />
      <div className="relative max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-6">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="rounded-2xl border border-border bg-card/60 p-8"
        >
          <ClipboardList className="w-8 h-8 text-primary mb-4" />
          <h3 className="font-sora font-bold text-xl mb-2">What we need to review your application</h3>
          <p className="text-sm text-muted-foreground mb-5">To prepare an accurate migration scope, we typically need the following. Repository access can remain read-only during the initial review.</p>
          <ul className="space-y-2.5">
            {reviewNeeds.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="rounded-2xl border border-primary bg-primary/5 glow-orange p-8 flex flex-col"
        >
          <SearchCheck className="w-8 h-8 text-primary mb-4" />
          <h3 className="font-sora font-bold text-xl mb-2">Migration Readiness Assessment</h3>
          <p className="text-sm text-muted-foreground mb-5">Not sure whether your application is ready to leave Base44? We evaluate the application and identify:</p>
          <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-2.5 mb-6 flex-1">
            {readinessItems.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-sm text-foreground font-medium mb-4">The assessment gives you a clear roadmap before committing to the full migration.</p>
          <Link to="/contact" onClick={() => onCTA?.("readiness_assessment")}>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              Request an Assessment <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}