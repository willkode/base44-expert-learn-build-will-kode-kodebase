import React from "react";
import { motion } from "framer-motion";

export default function KodeMailSectionHeading({ eyebrow, title, subtitle, align = "center" }) {
  const isCenter = align === "center";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5 }}
      className={`${isCenter ? "text-center mx-auto" : "text-left"} max-w-2xl mb-10 sm:mb-12`}
    >
      {eyebrow && (
        <span className="inline-block mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-primary/90">
          {eyebrow}
        </span>
      )}
      <h2 className="font-sora font-bold text-2xl sm:text-3xl md:text-[2.5rem] leading-[1.15] tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">{subtitle}</p>
      )}
    </motion.div>
  );
}