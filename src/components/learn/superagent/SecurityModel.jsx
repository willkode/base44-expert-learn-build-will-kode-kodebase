import React from "react";
import { ShieldCheck, Settings, ShieldX, AlertTriangle } from "lucide-react";
import SectionHeading from "@/components/learn/superagent/SectionHeading";
import { SECURITY } from "@/components/learn/superagent/data";

const TONES = {
  ok: { icon: ShieldCheck, color: "text-primary", border: "border-primary/30", bg: "bg-primary/5" },
  warn: { icon: Settings, color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/5" },
  bad: { icon: ShieldX, color: "text-destructive", border: "border-destructive/20", bg: "bg-destructive/5" },
};

export default function SecurityModel() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeading label="Security Model" title="Trust & Access" />
      <div className="grid md:grid-cols-3 gap-5">
        {SECURITY.map((s) => {
          const t = TONES[s.tone];
          return (
            <div key={s.title} className={`rounded-2xl border p-6 ${t.border} ${t.bg}`}>
              <div className={`flex items-center gap-2 font-sora font-bold text-lg mb-4 ${t.color}`}>
                <t.icon className="w-5 h-5" /> {s.title}
              </div>
              <ul className="space-y-2">
                {s.items.map((i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${t.color.replace("text-", "bg-")}`} />
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="flex items-start gap-3 max-w-3xl mx-auto rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 mt-10">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Important Warning — </span>
          The agent operates with service-role style access inside its attached app. It may see all
          app data even if normal users cannot. Treat it like a privileged operator, not a normal user.
        </p>
      </div>
    </section>
  );
}