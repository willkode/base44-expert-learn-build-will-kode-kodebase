import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import AllAccessButton from "@/components/shared/AllAccessButton";
import {
  isSummerSaleActive,
  formatUsd,
  FLASH_SALE_PRICE_CENTS,
  ALL_ACCESS_PRICE_CENTS,
} from "@/lib/summerSale";

export default function FlashSaleBand() {
  if (!isSummerSaleActive()) return null;

  const flash = formatUsd(FLASH_SALE_PRICE_CENTS);
  const allAccess = formatUsd(ALL_ACCESS_PRICE_CENTS);

  return (
    <section className="relative px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto rounded-2xl border border-primary/40 bg-card/80 glow-orange overflow-hidden"
      >
        <div className="h-1 bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15]" />
        <div className="flex flex-col md:flex-row items-center gap-5 md:gap-8 p-6 md:p-8">
          <div className="flex items-center gap-4 flex-1 text-center md:text-left flex-col md:flex-row">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gradient-orange mb-1">
                Flash Sale
              </p>
              <h2 className="font-sora font-bold text-xl md:text-2xl mb-1">
                Every product <span className="text-gradient-orange">{flash}</span> — or take them
                all for <span className="text-gradient-orange">{allAccess}</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                One-time pricing, applied automatically at checkout. The all-access bundle unlocks
                every KodeBase product, with lifetime updates on each one.
              </p>
            </div>
          </div>
          <AllAccessButton
            location="home_flash_sale_band"
            className="bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] hover:opacity-90 text-[#0a0f1e] font-semibold border-0 shrink-0"
          />
        </div>
      </motion.div>
    </section>
  );
}
