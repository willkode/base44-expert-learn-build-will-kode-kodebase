import React from "react";
import { X, AlertTriangle } from "lucide-react";
import SectionHeading from "@/components/learn/superagent/SectionHeading";
import { BOUNDARIES } from "@/components/learn/superagent/data";

export default function Boundaries() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeading label="Boundaries" title="What the Agent Cannot Do" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {BOUNDARIES.map((b) => (
          <div key={b.title} className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5">
            <h3 className="font-sora font-bold text-base mb-3">{b.title}</h3>
            <ul className="space-y-2">
              {b.items.map((it) => (
                <li key={it} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
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