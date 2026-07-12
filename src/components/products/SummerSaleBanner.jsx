import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { isSummerSaleActive, SUMMER_SALE_END_LABEL, saleEndDate } from "@/lib/summerSale";

function getRemaining(end) {
  const diff = Math.max(0, end.getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function TimeBox({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-sora font-extrabold text-2xl md:text-3xl tabular-nums text-[#0a0f1e]">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] uppercase tracking-widest text-[#0a0f1e]/70 font-semibold">{label}</span>
    </div>
  );
}

export default function SummerSaleBanner() {
  const end = saleEndDate();
  const [remaining, setRemaining] = useState(() => getRemaining(end));

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining(end)), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              Will's Birthday Sale — 86% off everything
            </p>
            <p className="text-sm text-[#0a0f1e]/80 font-medium">Ends {SUMMER_SALE_END_LABEL}. One-time pricing, locked in.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <TimeBox value={remaining.days} label="Days" />
          <span className="font-sora font-extrabold text-2xl text-[#0a0f1e]/50 -mt-3">:</span>
          <TimeBox value={remaining.hours} label="Hrs" />
          <span className="font-sora font-extrabold text-2xl text-[#0a0f1e]/50 -mt-3">:</span>
          <TimeBox value={remaining.minutes} label="Min" />
          <span className="font-sora font-extrabold text-2xl text-[#0a0f1e]/50 -mt-3">:</span>
          <TimeBox value={remaining.seconds} label="Sec" />
        </div>
      </div>
    </motion.div>
  );
}