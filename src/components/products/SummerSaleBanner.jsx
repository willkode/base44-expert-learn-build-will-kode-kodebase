import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { isSummerSaleActive } from "@/lib/summerSale";

export default function SummerSaleBanner() {
  if (!isSummerSaleActive()) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto mb-10 rounded-2xl bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] p-[1.5px] glow-orange"
    >
      <div className="rounded-2xl bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-3 text-center md:text-left">
          <Sparkles className="w-6 h-6 text-[#0a0f1e] shrink-0" />
          <div>
            <p className="font-sora font-extrabold text-lg md:text-xl text-[#0a0f1e] leading-tight">
              55% off all products
            </p>
            <p className="text-sm text-[#0a0f1e]/80 font-medium">Automatically applied at checkout. One-time pricing, locked in.</p>
          </div>
        </div>

      </div>
    </motion.div>
  );
}