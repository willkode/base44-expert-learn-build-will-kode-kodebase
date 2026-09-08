import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

export default function FAQ({ faqs }) {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div className="space-y-3">
      {faqs.map((faq, idx) => {
        const open = openIndex === idx;
        return (
          <div
            key={idx}
            className={`rounded-2xl border bg-card/50 transition-colors ${
              open ? "border-primary/40" : "border-border hover:border-primary/25"
            }`}
          >
            <button
              onClick={() => setOpenIndex(open ? null : idx)}
              aria-expanded={open}
              className="w-full text-left flex items-center justify-between gap-4 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
            >
              <span className="font-semibold text-foreground text-sm sm:text-base">{faq.q}</span>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                  open ? "border-primary/40 bg-primary/15 text-primary rotate-45" : "border-border text-muted-foreground"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}