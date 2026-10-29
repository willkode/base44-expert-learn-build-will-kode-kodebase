import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { trackCTA } from "@/lib/analytics";
import {
  isSummerSaleActive,
  formatUsd,
  FLASH_SALE_PRICE_CENTS,
  ALL_ACCESS_PRICE_CENTS,
  ALL_ACCESS_SLUG,
} from "@/lib/summerSale";

export default function SummerSaleBanner() {
  const navigate = useNavigate();
  const [bundle, setBundle] = useState(null);

  useEffect(() => {
    base44.entities.Product.filter({ slug: ALL_ACCESS_SLUG, active: true })
      .then((items) => setBundle(items[0] || null))
      .catch(() => {});
  }, []);

  if (!isSummerSaleActive()) return null;

  const flash = formatUsd(FLASH_SALE_PRICE_CENTS);
  const allAccess = formatUsd(ALL_ACCESS_PRICE_CENTS);

  // Straight to checkout once the bundle is loaded; until then, its product
  // page, so the button is never dead.
  const buyEverything = () => {
    trackCTA({
      text: `Get every product — ${allAccess}`,
      location: "products_sale_banner",
      destination: bundle ? "/checkout" : `/products/${ALL_ACCESS_SLUG}`,
    });
    navigate(bundle ? `/checkout?product=${bundle.id}` : `/products/${ALL_ACCESS_SLUG}`);
  };

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
              {flash} Flash Sale — every product {flash}
            </p>
            <p className="text-sm text-[#0a0f1e]/80 font-medium">
              Or unlock every product at once for {allAccess}. Applied automatically at checkout — one-time pricing, locked in.
            </p>
          </div>
        </div>

        <Button
          onClick={buyEverything}
          size="lg"
          className="shrink-0 font-bold bg-[#0a0f1e] text-white hover:bg-[#0a0f1e]/90 shadow-lg"
        >
          Get every product — {allAccess}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}
