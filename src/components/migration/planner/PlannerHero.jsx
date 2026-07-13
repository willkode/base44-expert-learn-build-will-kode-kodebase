import { ShieldCheck } from "lucide-react";
import PlannerCTA from "./PlannerCTA";

export default function PlannerHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-card/60 px-6 py-16 text-center blueprint-grid">
      <div className="absolute inset-0 bg-primary/5" />
      <div className="relative max-w-3xl mx-auto">
        <div className="inline-flex gap-2 items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-5">
          <ShieldCheck className="w-4 h-4" /> Authorized source-code assessment
        </div>
        <h1 className="font-sora text-4xl md:text-6xl font-extrabold tracking-tight mb-5">
          Plan Your <span className="text-gradient-orange">Base44 Migration</span> Before You Spend Thousands
        </h1>
        <p className="text-lg text-muted-foreground mb-4">
          Connect your Base44 GitHub repository and receive a detailed technical roadmap for moving your app to independent infrastructure.
        </p>
        <p className="text-muted-foreground mb-6">
          See what needs to be migrated, what can remain unchanged, which systems create the most risk, and how much a professional migration is likely to cost.
        </p>
        <p className="font-semibold mb-7">Unlock your complete migration plan for a one-time payment of $25.</p>
        <div className="flex justify-center mb-5"><PlannerCTA location="hero" /></div>
        <p className="text-sm text-muted-foreground">Professional Base44 migrations start at <span className="font-semibold text-foreground">$2,000</span>.</p>
      </div>
    </section>
  );
}