import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
};

// One benefit. Same data fields (icon, title, badge, color, iconColor, description, features, cta).
export default function ProBenefitCard({ benefit, index }) {
  const { icon: Icon, title, badge, color, iconColor, description, features, cta } = benefit;
  return (
    <motion.div
      variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={index}
      whileHover={{ y: -4 }}
      className={`group relative rounded-2xl border bg-gradient-to-br ${color} p-6 md:p-7 flex flex-col gap-5 overflow-hidden transition-shadow hover:shadow-2xl hover:shadow-black/30`}
    >
      {/* corner glow on hover */}
      <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-white/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-card/60 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-sora font-bold text-lg">{title}</h3>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/10 text-white/70">{badge}</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>

      <ul className="relative space-y-2.5 pl-1">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-sm text-foreground/80">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      <div className="relative mt-auto pt-1">
        <Link to={cta.href}>
          <Button size="sm" variant="outline" className="w-full border-white/10 hover:bg-white/5 font-medium group-hover:border-primary/40 transition-colors">
            {cta.label} <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}