import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Crown, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { trackPricingPlanClick } from "@/lib/analytics";

const PRO_PERKS = [
  "Blueprint System — 25 blueprints/month",
  "Prompt Engine — ordered build prompt packs",
  "Prompt Vault — 200+ curated expert prompts",
  "Priority support via WhatsApp & email",
  "25 projects, client-ready exports",
  "Security reviews & QA checklists",
];

export default function Pricing() {
  const navigate = useNavigate();

  const handleCTA = () => {
    trackPricingPlanClick({ planId: "pro", planName: "Pro", price: 25 });
    navigate("/pro");
  };

  return (
    <section id="pricing" className="py-24 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-widest">Pricing</span>
          <h2 className="font-sora font-bold text-3xl md:text-5xl tracking-tight mt-4 mb-5">
            Architect once. Build right. <span className="text-gradient-orange">Skip the rebuild.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            One Pro plan. Everything you need to go from idea to shipped app.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto rounded-2xl border border-primary bg-card glow-orange p-10 flex flex-col items-center text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 mb-6">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Pro Membership</span>
          </div>

          <div className="flex items-end gap-1 mb-2 justify-center">
            <span className="font-sora font-extrabold text-6xl">$25</span>
            <span className="text-muted-foreground mb-2">/mo</span>
          </div>
          <p className="text-muted-foreground text-sm mb-8">For freelance vibecoders who build seriously.</p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mb-10 text-left w-full max-w-lg">
            {PRO_PERKS.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-foreground">{f}</span>
              </li>
            ))}
          </ul>

          <Button
            size="lg"
            onClick={handleCTA}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-10"
          >
            See everything in Pro <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <p className="text-xs text-muted-foreground mt-4">Cancel anytime. No contracts.</p>
        </motion.div>
      </div>
    </section>
  );
}