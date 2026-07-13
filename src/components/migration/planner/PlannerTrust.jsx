import { motion } from "framer-motion";
import { ShieldCheck, Scale, XCircle, CheckCircle2 } from "lucide-react";
import PlannerSection from "./PlannerSection";
import { trustItems, legalityExclusions } from "./plannerData";

export default function PlannerTrust() {
  return (
    <PlannerSection eyebrow="Trust & ownership" title="Your Repository Stays Yours">
      <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto items-start">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-border bg-card/60 p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><ShieldCheck className="w-5 h-5" /></span>
            <h3 className="font-sora font-semibold text-lg">Read-only, authorized access</h3>
          </div>
          <ul className="space-y-3">
            {trustItems.map((item) => (
              <li key={item} className="text-sm text-muted-foreground flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />{item}
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-border bg-card/60 p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Scale className="w-5 h-5" /></span>
            <h3 className="font-sora font-semibold text-lg">Is migrating a Base44 app allowed?</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Base44's Terms of Service state that, subject to Base44's ownership rights described in the terms, customers own the rights they hold under applicable law in the code and applications generated through the platform. Base44 also provides GitHub integration and local-development documentation for exported application code.
          </p>
          <p className="text-sm text-muted-foreground mb-3">This tool is intended only for repositories and applications that you own or are authorized to manage. It does not involve:</p>
          <ul className="space-y-2 mb-4">
            {legalityExclusions.map((item) => (
              <li key={item} className="text-sm text-muted-foreground flex items-start gap-2.5">
                <XCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />{item}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">You should always review the current Base44 Terms of Service and obtain legal advice when necessary.</p>
        </motion.div>
      </div>
    </PlannerSection>
  );
}