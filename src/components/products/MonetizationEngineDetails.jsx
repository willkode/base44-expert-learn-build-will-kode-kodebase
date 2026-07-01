import React from "react";
import { motion } from "framer-motion";
import { CreditCard, Repeat, ShieldCheck, TrendingUp, Percent, Wallet, Users, Sparkles, CheckCircle2 } from "lucide-react";

const builds = [
  { icon: CreditCard, title: "Checkout & one-time products", desc: "Hosted checkout flows, product catalog, and secure payment link generation." },
  { icon: Repeat, title: "Subscriptions & paywalls", desc: "Plan tiers, feature gating, upgrade/downgrade flows, and usage limits." },
  { icon: ShieldCheck, title: "Webhook reconciliation", desc: "Bulletproof payment verification so access is granted only after real payment." },
  { icon: Wallet, title: "Customer billing portal", desc: "Purchase history, receipts, active plan status, and self-serve management." },
  { icon: Percent, title: "Promos & discounts", desc: "Sale pricing, promo codes, limited-time offers, and loyalty discounts." },
  { icon: TrendingUp, title: "Revenue dashboard", desc: "Admin sales analytics — revenue, conversions, refunds, and top products." },
];

const outcomes = [
  "Charge for your app with real subscription tiers",
  "Sell one-time digital products with instant delivery",
  "Gate premium features behind plans safely",
  "Recover failed payments instead of losing customers",
  "Run sales and promos without touching code twice",
  "See exactly what's making money from an admin dashboard",
];

const audience = [
  "Builders launching their first paid SaaS",
  "Vibe coders adding revenue to client projects",
  "Founders moving from free beta to paid plans",
  "Agencies packaging monetization for clients",
];

export default function MonetizationEngineDetails() {
  return (
    <section className="max-w-5xl mx-auto mt-24">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center max-w-3xl mx-auto">
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">What It Builds</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-5">
          A complete <span className="text-gradient-orange">revenue layer</span> for your app
        </h2>
        <p className="text-lg text-muted-foreground">
          Most builders can build an app — very few can charge for it properly. This prompt series walks you step by
          step through installing the entire monetization stack: checkout, subscriptions, paywalls, webhooks, billing
          portal, promos, and revenue analytics.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
        {builds.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06 }} className="rounded-2xl border border-border bg-card p-6 text-left">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#f87171] via-[#fb923c] to-[#facc15] flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-[#0a0f1e]" />
              </div>
              <h4 className="font-sora font-semibold text-base mb-2">{item.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mt-24 rounded-2xl border border-border bg-card p-8 md:p-10">
        <h3 className="font-sora font-bold text-xl mb-6 text-center">What you'll be able to do</h3>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
          {outcomes.map((o) => (
            <div key={o} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span>{o}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center max-w-3xl mx-auto mt-24">
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">Who It's For</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-5">
          Built for builders who want to <span className="text-gradient-orange">get paid</span>
        </h2>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-5 mt-12">
        {audience.map((a, i) => (
          <motion.div key={a} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06 }} className="flex items-start gap-3 rounded-2xl border border-border bg-card/60 p-6 text-left">
            <Users className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <span className="text-sm text-muted-foreground leading-relaxed">{a}</span>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center max-w-3xl mx-auto mt-24">
        <Sparkles className="w-8 h-8 text-primary mx-auto mb-5" />
        <h2 className="font-sora font-bold text-3xl tracking-tight mb-5">
          The fastest path from app to <span className="text-gradient-orange">income</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          Every prompt is battle-tested on real production apps that process real payments. No theory — a proven,
          sequential build path that ends with a working revenue system you can trust.
        </p>
      </motion.div>
    </section>
  );
}