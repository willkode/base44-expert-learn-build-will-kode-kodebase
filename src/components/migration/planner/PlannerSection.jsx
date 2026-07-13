import { motion } from "framer-motion";

// Shared section shell: eyebrow + heading + optional intro, centered, scroll-reveal.
export default function PlannerSection({ eyebrow, title, intro, children, className = "" }) {
  return (
    <section className={className}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto mb-10 md:mb-14"
      >
        {eyebrow && (
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-primary mb-4">
            {eyebrow}
          </span>
        )}
        <h2 className="font-sora text-3xl md:text-[2.6rem] md:leading-[1.15] font-bold tracking-tight mb-4">{title}</h2>
        {intro && <p className="text-base md:text-lg text-muted-foreground leading-relaxed">{intro}</p>}
      </motion.div>
      {children}
    </section>
  );
}