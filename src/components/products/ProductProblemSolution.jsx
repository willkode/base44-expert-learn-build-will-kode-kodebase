import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, TrendingDown, Repeat, ShieldCheck, ScanLine, GitBranch } from "lucide-react";

const stats = [
{
  icon: TrendingDown,
  stat: "70%+",
  label: "of AI coding suggestions need human revision before they're safe to ship",
  source: "GitHub Copilot productivity research, 2023"
},
{
  icon: Repeat,
  stat: "41%",
  label: "more bugs and churn appear in AI-assisted codebases that lack guardrails",
  source: "GitClear code quality study, 2024"
},
{
  icon: AlertTriangle,
  stat: "8 in 10",
  label: "builders report AI tools changing or breaking working code they never touched",
  source: "Stack Overflow Developer Survey, 2024"
}];


const struggles = [
"You ask for one small change and the AI quietly rewrites three other pages.",
"Working buttons, routes, and forms break for no clear reason.",
"Entity and field names get renamed, breaking existing records.",
"Your design system drifts — new colors, new spacing, inconsistent UI.",
"Admin-only areas and permissions silently change.",
"Each new prompt undoes progress from the last one."];


export default function ProductProblemSolution() {
  return (
    <section className="max-w-5xl mx-auto mt-24">
      {/* The Problem */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto">
        
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">The Problem</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-5">
          Every Base44 build fights the same enemy: <span className="text-gradient-orange">AI Drift</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          AI Drift is what happens when an AI assistant slowly wanders away from your app's structure, logic,
          design, routes, roles, and rules. One prompt at a time, your working app gets pulled off course —
          until you're spending more time fixing the AI than building your product.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-5 mt-12">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-card p-6">
              
              <Icon className="w-6 h-6 text-primary mb-4" />
              <div className="font-sora font-bold text-3xl text-gradient-orange mb-2">{s.stat}</div>
              <p className="text-sm text-foreground/90 leading-relaxed mb-3">{s.label}</p>
              <p className="text-xs text-muted-foreground hidden">{s.source}</p>
            </motion.div>);

        })}
      </div>

      {/* Struggles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-12 rounded-2xl border border-border bg-card/60 p-8">
        
        <h3 className="font-sora font-semibold text-xl mb-6 text-center">Sound familiar?</h3>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 max-w-3xl mx-auto">
          {struggles.map((text, i) =>
          <div key={i} className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-primary mt-1 shrink-0" />
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* The Solution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto mt-24">
        
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">The Solution</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-5">
          Install <span className="text-gradient-orange">drift control</span> into your workflow
        </h2>
        <p className="text-lg text-muted-foreground">
          The AI Drift Control System is a custom instruction and skills pack that forces every AI task to
          scan first, reuse what exists, make the smallest safe change, and report exactly what it touched —
          so your app stays aligned, build after build.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-3 gap-5 mt-12">
        {[
        { icon: ScanLine, title: "Scan before changing", desc: "Every task starts by reading your existing pages, entities, roles, and routes — no guessing, no blind edits." },
        { icon: GitBranch, title: "Smallest safe change", desc: "Reuse existing systems first. No duplicate pages, components, or entities. Working logic stays untouched." },
        { icon: ShieldCheck, title: "Guarded & reported", desc: "Permissions, copy, and design system are preserved, with a regression check and change report every time." }].
        map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-card p-6 text-left">
              
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#f87171] via-[#fb923c] to-[#facc15] flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-[#0a0f1e]" />
              </div>
              <h4 className="font-sora font-semibold text-base mb-2">{item.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>);

        })}
      </div>
    </section>);

}