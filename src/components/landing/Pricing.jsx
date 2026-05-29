import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "",
    desc: "Generate a basic app blueprint.",
    features: ["1 project blueprint", "Core architecture & data model", "Basic role map", "Community support"],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$39",
    period: "/mo",
    desc: "For serious builders & founders.",
    features: [
      "Unlimited projects",
      "Saved blueprints & revision history",
      "Full security & permissions model",
      "AI prompt pack exports",
      "Platform-specific output",
    ],
    cta: "Go Pro",
    highlight: true,
  },
  {
    name: "Agency",
    price: "$149",
    period: "/mo",
    desc: "For teams & client work.",
    features: [
      "Everything in Pro",
      "Client workspaces",
      "Branded exports & proposals",
      "Team access",
      "Priority support",
    ],
    cta: "Start Agency",
    highlight: false,
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const getStarted = () => navigate("/register");

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
            Architect once. Build right.
          </h2>
          <p className="text-lg text-muted-foreground">
            Start free. Upgrade when you're ready to ship serious software.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                t.highlight
                  ? "border-primary bg-card glow-orange scale-[1.03]"
                  : "border-border bg-card/60"
              }`}
            >
              {t.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wide">
                  Most Popular
                </span>
              )}
              <h3 className="font-sora font-bold text-xl mb-1">{t.name}</h3>
              <p className="text-sm text-muted-foreground mb-5">{t.desc}</p>
              <div className="flex items-end gap-1 mb-6">
                <span className="font-sora font-extrabold text-4xl">{t.price}</span>
                <span className="text-muted-foreground mb-1.5">{t.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={getStarted}
                className={`w-full font-semibold ${
                  t.highlight
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "bg-secondary hover:bg-secondary/80 text-foreground"
                }`}
              >
                {t.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}