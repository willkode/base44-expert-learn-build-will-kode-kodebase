import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import PlannerCTA from "./PlannerCTA";

const fade = (delay) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay },
});

export default function PlannerHero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card/50 blueprint-grid">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-72 w-72 rounded-full bg-orange-500/10 blur-[100px]" />

      <div className="relative px-5 py-16 md:px-12 md:py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fade(0)} className="inline-flex gap-2 items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-6 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4" /> Authorized source-code assessment
          </motion.div>

          <motion.h1 {...fade(0.08)} className="font-sora text-[2.4rem] leading-[1.08] md:text-6xl font-extrabold tracking-tight mb-6">
            Don't Guess What Leaving Base44 Will Cost. <span className="text-gradient-orange">Know</span> — Before You Spend Thousands.
          </motion.h1>

          <motion.p {...fade(0.16)} className="text-lg md:text-xl text-muted-foreground mb-4">
            Connect your Base44 GitHub repository and get an exact technical roadmap: what must be migrated, what can stay untouched, where the risk hides, and what a professional migration will actually cost.
          </motion.p>

          <motion.div {...fade(0.3)} className="mx-auto max-w-md rounded-2xl border border-primary/25 bg-background/60 backdrop-blur-sm px-6 py-5 mb-8">
            <p className="font-sora font-semibold text-foreground">
              Your complete migration plan — one-time payment of <span className="text-gradient-orange text-2xl align-middle font-extrabold">$25</span>.
            </p>
          </motion.div>

          <motion.div {...fade(0.38)} className="flex justify-center mb-6">
            <PlannerCTA location="hero" />
          </motion.div>

          <motion.p {...fade(0.44)} className="text-sm text-muted-foreground">
            Professional Base44 migrations start at <span className="font-semibold text-foreground">$2,000</span>.
          </motion.p>
        </div>
      </div>
    </section>
  );
}