import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const outputs = [
  "Product breakdown & core workflows",
  "User roles (Admin, Customer, Support, etc.)",
  "Full entity / data model with relations",
  "Permissions model — exactly who can do what",
  "Complete page map (user + admin)",
  "Feature phases — MVP, V1, V2, and beyond",
  "Sequenced, copy-ready AI build prompts",
  "QA checklist & launch readiness plan",
];

export default function Blueprint() {
  return (
    <section id="blueprint" className="py-24 relative scroll-mt-20">
      <div className="absolute inset-0 blueprint-grid opacity-30" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">What You Get</span>
            <h2 className="font-sora font-bold text-3xl md:text-5xl tracking-tight mt-4 mb-6">
              Your entire app, planned before you build it
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              A complete Build Blueprint — every decision documented, structured, and ready to hand
              to AI or your team. No guesswork, no missing pieces, no expensive surprises mid-build.
            </p>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
              {outputs.map((o, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-5 h-5 mt-0.5 shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{o}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-border bg-card/80 p-6 font-mono text-sm shadow-2xl"
          >
            <div className="text-muted-foreground mb-4"># build-blueprint.md</div>
            <div className="space-y-2 leading-relaxed">
              <p><span className="text-primary">##</span> Entities</p>
              <p className="text-muted-foreground pl-4">Users, Profiles, Projects, Tasks,</p>
              <p className="text-muted-foreground pl-4">Messages, Payments, Notifications</p>
              <p className="pt-2"><span className="text-primary">##</span> Roles &amp; Access</p>
              <p className="text-muted-foreground pl-4">Admin · Contractor · Customer</p>
              <p className="text-muted-foreground pl-4">→ ownership checks on Projects</p>
              <p className="pt-2"><span className="text-primary">##</span> Build Prompts</p>
              <p className="text-chart-2 pl-4">[1] Build entity structure</p>
              <p className="text-chart-2 pl-4">[2] Auth &amp; roles</p>
              <p className="text-chart-2 pl-4">[3] Add security rules</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}