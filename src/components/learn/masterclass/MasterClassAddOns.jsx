import React from "react";
import { ArrowUpRight } from "lucide-react";
import { ADD_ONS } from "./masterClassData";

export default function MasterClassAddOns() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 border-t border-border">
      <h2 className="font-sora font-extrabold text-3xl tracking-tight text-center">
        Continue into <span className="text-gradient-orange">marketing and agency ownership</span>
      </h2>
      <p className="mt-4 text-center text-muted-foreground max-w-2xl mx-auto">
        Take only the development track, or keep going. Add-on courses are released after the core
        program and sold separately.
      </p>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {ADD_ONS.map((a) => (
          <div key={a.name} className="rounded-xl border border-border bg-card/50 p-7">
            <h3 className="font-sora font-bold text-xl">{a.name}</h3>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-primary">
              {a.duration}
            </p>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{a.promise}</p>
            <ul className="mt-5 space-y-2.5">
              {a.weeks.map((w) => (
                <li key={w} className="flex items-start gap-2.5 text-sm">
                  <ArrowUpRight className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                  <span className="text-muted-foreground leading-relaxed">{w}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}