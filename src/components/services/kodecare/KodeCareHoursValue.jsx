import React from "react";
import { motion } from "framer-motion";
import { Clock, Timer, CheckCircle } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
};

const taskTimes = [
  { time: "5–10 min", label: "Bug fix, copy change, or styling tweak" },
  { time: "10–20 min", label: "New form, modal, or table with validation" },
  { time: "20–30 min", label: "New page with SEO, tracking, and responsive layout" },
  { time: "30–45 min", label: "Entity + CRUD flow wired end to end" },
  { time: "45–60 min", label: "Backend function or third-party integration" },
  { time: "1–2 hrs", label: "Multi-step feature (checkout, dashboard, automation)" },
];

const perPlan = [
  {
    hours: "2 hours",
    plan: "Starter",
    line: "Roughly 12–20 small items a month",
    items: [
      "8–12 bug fixes or UI tweaks",
      "1–2 new pages or forms",
      "Security patch pass",
      "Monthly health check",
    ],
  },
  {
    hours: "5 hours",
    plan: "Growth",
    line: "Roughly 30–45 items a month",
    items: [
      "Everything in Starter, at 2.5x volume",
      "3–5 real features shipped",
      "A backend function or integration",
      "Performance and SEO tuning",
    ],
    highlight: true,
  },
  {
    hours: "10 hours",
    plan: "Pro",
    line: "Roughly 60–90 items a month",
    items: [
      "Multiple complex features per month",
      "Integrations, payments, automations",
      "Refactors and architecture work",
      "Effectively a part-time dev on your app",
    ],
  },
];

export default function KodeCareHoursValue() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 blueprint-grid opacity-10" />
      <div className="relative max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">What your hours buy</p>
          <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">
            An hour with me isn't a normal dev hour.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Most requests take 5–10 minutes to build. That's not a shortcut — it's 20+ years as a full stack
            developer combined with prompt engineering that gets it right the first time. Two hours goes a lot
            further than you'd expect.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-14">
          {taskTimes.map((t, i) => (
            <motion.div
              key={t.label}
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.3}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card/60"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Timer className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-sora font-bold text-sm text-gradient-orange">{t.time}</p>
                <p className="text-sm text-muted-foreground">{t.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {perPlan.map((p, i) => (
            <motion.div
              key={p.plan}
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.4}
              className={`rounded-2xl border p-6 ${p.highlight ? "border-primary bg-primary/5" : "border-border bg-card/60"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-sora font-extrabold text-xl">{p.hours}</span>
              </div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">{p.plan}</p>
              <p className="text-sm text-foreground font-medium mb-4">{p.line}</p>
              <ul className="space-y-2">
                {p.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-8 max-w-2xl mx-auto">
          Estimates based on typical Base44 work. Complex integrations and architecture changes take longer —
          I'll always tell you the estimate before starting.
        </p>
      </div>
    </section>
  );
}