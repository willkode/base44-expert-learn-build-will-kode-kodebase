import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: (i % 3) * 0.08 } }),
};

// Benefit card matched to the Home "Workspace" card pattern: full-bleed AI image top
// with a card gradient overlay, icon + numbered index, then content. Same data fields
// (icon, title, badge, iconColor, description, features, cta) plus `image`.
export default function ProBenefitCard({ benefit, index }) {
  const { icon: Icon, title, badge, iconColor, description, features, cta, image } = benefit;
  return (
    <motion.div
      variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={index}
      className="group relative rounded-2xl border border-border bg-card/70 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
    >
      <div className="relative h-40 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-card/95 via-card/30 to-transparent" />
        <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-background/70 border border-white/10 text-white/80 backdrop-blur-sm">
          {badge}
        </span>
      </div>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-7 pt-5 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-105 transition-all duration-300">
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <span className="text-xs font-mono text-muted-foreground">0{index + 1}</span>
        </div>

        <h3 className="font-sora font-bold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{description}</p>

        <ul className="space-y-2.5 mb-6">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-foreground/80">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          <Link to={cta.href}>
            <Button size="sm" variant="outline" className="w-full border-white/10 hover:bg-white/5 font-medium group-hover:border-primary/40 transition-colors">
              {cta.label} <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}