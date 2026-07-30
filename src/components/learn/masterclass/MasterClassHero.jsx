import React from "react";
import { CalendarDays, Users, Clock } from "lucide-react";
import { CLASS_INFO, PROGRAM_STATS } from "./masterClassData";

const HERO_IMAGE =
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/709424cb6_generated_image.png";

export default function MasterClassHero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 blueprint-grid opacity-30" />
      <div className="relative max-w-6xl mx-auto px-6 pt-28 pb-16 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            Live cohort · {CLASS_INFO.seats} seats only
          </span>
          <h1 className="mt-6 font-sora font-extrabold text-4xl md:text-5xl tracking-tight leading-tight">
            The <span className="text-gradient-orange">Base44 Master Class</span>
          </h1>
          <p className="mt-3 font-sora font-semibold text-lg text-foreground/90">
            {CLASS_INFO.subtitle} — from prompt engineering to building, marketing, and selling software.
          </p>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            Learn how to plan, build, test, secure, launch, market, and sell real web, mobile, and
            desktop applications using Base44, Claude, and modern AI development workflows. You
            won't just generate apps — you'll learn to think like a developer and manage AI like an
            engineering team.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              {CLASS_INFO.startLabel}
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2">
              <Clock className="w-4 h-4 text-primary" />
              20 weeks · 5–10 hrs/week
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2">
              <Users className="w-4 h-4 text-primary" />
              Limited to {CLASS_INFO.seats} students
            </span>
          </div>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PROGRAM_STATS.map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card/50 p-4">
                <p className="font-sora font-extrabold text-2xl text-gradient-orange">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative rounded-2xl overflow-hidden border border-border">
          <img src={HERO_IMAGE} alt="Base44 Master Class" className="w-full h-full object-cover" />
        </div>
      </div>
    </section>
  );
}