import { motion } from "framer-motion";
import PlannerSection from "./PlannerSection";
import { journeySteps } from "./plannerData";

export default function PlannerJourney() {
  return (
    <PlannerSection eyebrow="How it works" title={'Five Steps From "No Idea" to a Complete Migration Plan'}>
      <div className="relative max-w-4xl mx-auto">
        {/* Timeline spine (desktop) */}
        <div className="hidden md:block absolute left-[27px] top-4 bottom-4 w-px bg-gradient-to-b from-primary/60 via-primary/25 to-transparent" />
        <div className="space-y-5 md:space-y-8">
          {journeySteps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="relative md:pl-20"
            >
              {/* Node */}
              <div className="hidden md:flex absolute left-0 top-1 h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-background text-primary font-sora font-bold text-xl glow-orange">
                {i + 1}
              </div>
              <div className="rounded-2xl border border-border bg-card/60 p-6 md:p-7 transition-colors hover:border-primary/40">
                <div className="flex items-center gap-3 mb-3 md:mb-2">
                  <span className="md:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-sora font-bold">{i + 1}</span>
                  <h3 className="font-sora font-semibold text-lg md:text-xl">{step.title}</h3>
                </div>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{step.text}</p>
                {step.items && (
                  <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
                    {step.items.map((item) => (
                      <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-gradient-to-r from-red-400 to-amber-400 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PlannerSection>
  );
}