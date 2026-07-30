import React from "react";
import { WEEKLY_FORMAT, PHASES, WEEK_IMAGES } from "./masterClassData";

export default function MasterClassCurriculum() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 border-t border-border">
      <h2 className="font-sora font-extrabold text-3xl tracking-tight text-center">
        The <span className="text-gradient-orange">20-week</span> core curriculum
      </h2>
      <p className="mt-4 text-center text-muted-foreground max-w-2xl mx-auto">
        Four phases take you from beginner prompt engineering to production-level AI-assisted
        software development across web, mobile, and desktop.
      </p>

      <div className="mt-14 space-y-16">
        {PHASES.map((phase) => (
          <div key={phase.name}>
            <h3 className="font-sora font-bold text-xl text-primary">{phase.name}</h3>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {phase.weeks.map((w) => (
                <div
                  key={w.week}
                  className="group overflow-hidden rounded-xl border border-border bg-card/50 hover:border-primary/40 transition-colors"
                >
                  <div className="relative aspect-[16/9] overflow-hidden border-b border-border">
                    <img
                      src={WEEK_IMAGES[w.week]}
                      alt={`Week ${w.week} — ${w.title}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                  <div className="flex items-baseline gap-3">
                    <span className="font-sora font-extrabold text-sm text-gradient-orange">
                      Week {w.week}
                    </span>
                    <h4 className="font-sora font-semibold text-lg">{w.title}</h4>
                  </div>
                  <ol className="mt-4 space-y-2">
                    {w.days.map((d, i) => (
                      <li key={d} className="flex gap-3 text-sm">
                        <span className="shrink-0 w-16 text-xs font-semibold uppercase tracking-wide text-muted-foreground/70 pt-0.5">
                          {WEEKLY_FORMAT[i]?.day.slice(0, 3)}
                        </span>
                        <span className="text-muted-foreground leading-relaxed">{d}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-4 pt-4 border-t border-border text-sm text-foreground/80">
                    {w.outcome}
                  </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}