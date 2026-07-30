import React from "react";
import { WEEKLY_FORMAT } from "./masterClassData";

export default function MasterClassFormat() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="font-sora font-extrabold text-3xl tracking-tight text-center">
        Every week follows the same <span className="text-gradient-orange">predictable rhythm</span>
      </h2>
      <p className="mt-4 text-center text-muted-foreground max-w-2xl mx-auto">
        Most daily lessons take 30–60 minutes. Build sessions may need an extra hour or two. You can
        also complete a full week as a single self-paced module.
      </p>
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {WEEKLY_FORMAT.map((d) => (
          <div key={d.day} className="rounded-xl border border-border bg-card/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              {d.day}
            </p>
            <p className="mt-2 font-sora font-bold text-lg text-primary">{d.type}</p>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{d.purpose}</p>
          </div>
        ))}
      </div>
    </section>
  );
}