import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

// Staggered pill grid for long feature/dependency lists.
export default function ChipGrid({ items }) {
  return (
    <div className="flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto">
      {items.map((item, i) => (
        <motion.span
          key={item}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.5) }}
          className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/70 px-4 py-2 text-sm text-foreground/80 backdrop-blur-sm transition-colors hover:border-primary/50 hover:bg-primary/10"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
          {item}
        </motion.span>
      ))}
    </div>
  );
}