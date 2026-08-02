import React from "react";
import { motion } from "framer-motion";

export default function DashboardStats({ items }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      {items.map(({ icon: Icon, label, value }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 * i, ease: "easeOut" }}
          className="group relative overflow-hidden rounded-2xl border border-border bg-card/70 p-5 sm:p-6 transition-colors hover:border-primary/40"
        >
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/5 blur-2xl transition-opacity opacity-0 group-hover:opacity-100" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
              <p className="font-sora font-bold text-4xl mt-3 tabular-nums">{value}</p>
            </div>
            {Icon && (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <Icon className="w-5 h-5" aria-hidden="true" />
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}