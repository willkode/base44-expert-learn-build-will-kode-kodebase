import React from "react";
import { ArrowRight, Zap, Cpu } from "lucide-react";
import SectionHeading from "@/components/learn/superagent/SectionHeading";
import { TRIGGERS, HANDLER, READ_SCOPE, WRITE_SCOPE } from "@/components/learn/superagent/data";

function Pill({ children }) {
  return <span className="rounded-lg border border-border bg-secondary/40 px-3 py-1.5 text-sm">{children}</span>;
}

function ScopeCard({ title, badge, badgeTone, desc, items }) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-6">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-sora font-bold text-xl">{title}</h3>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${badgeTone}`}>{badge}</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{desc}</p>
      <div className="flex flex-wrap gap-2">{items.map((i) => <Pill key={i}>{i}</Pill>)}</div>
    </div>
  );
}

export default function MentalModel() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeading label="Core Mental Model" title="Dumb Trigger, Smart Handler" />

      <div className="grid md:grid-cols-[1fr_auto_1fr] items-center gap-6 mb-8">
        <div className="rounded-2xl border border-border bg-card/70 p-6">
          <div className="flex items-center gap-2 mb-4 font-sora font-bold text-lg">
            <Zap className="w-5 h-5 text-primary" /> Triggers
          </div>
          <div className="flex flex-wrap gap-2">{TRIGGERS.map((t) => <Pill key={t}>{t}</Pill>)}</div>
        </div>
        <ArrowRight className="w-8 h-8 text-primary mx-auto rotate-90 md:rotate-0" />
        <div className="rounded-2xl border border-primary/40 bg-card/70 p-6 glow-orange">
          <div className="flex items-center gap-2 mb-4 font-sora font-bold text-lg">
            <Cpu className="w-5 h-5 text-primary" /> Handler
          </div>
          <div className="flex flex-wrap gap-2">{HANDLER.map((t) => <Pill key={t}>{t}</Pill>)}</div>
        </div>
      </div>
      <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
        Simple events wake the agent. Once awake, it can do full logic, branching, chaining,
        API calls, emails, and write-backs.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <ScopeCard
          title="Read Scope" badge="Broad" badgeTone="bg-primary/20 text-primary"
          desc="The agent can read entity data from any app you own, using the app ID. Up to ~100 records per call with manual pagination."
          items={READ_SCOPE}
        />
        <ScopeCard
          title="Write Scope" badge="Local" badgeTone="bg-amber-500/20 text-amber-400"
          desc="All write actions are scoped to the attached app only. Schema changes, entity CRUD, and automations stay contained."
          items={WRITE_SCOPE}
        />
      </div>
    </section>
  );
}