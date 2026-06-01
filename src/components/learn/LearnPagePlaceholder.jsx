import React from "react";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";

export default function LearnPagePlaceholder({ title, description, icon: Icon }) {
  return (
    <>
      <Seo title={`${title} — KodeBase`} description={description} />
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-30" />
        <div className="relative max-w-3xl mx-auto px-6 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {Icon && (
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-7">
                <Icon className="w-8 h-8 text-primary" />
              </div>
            )}
            <h1 className="font-sora font-extrabold text-4xl md:text-5xl tracking-tight mb-5">
              {title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">{description}</p>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 mt-9">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">Content coming soon</span>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}