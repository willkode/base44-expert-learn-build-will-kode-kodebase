import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import {
  isSummerSaleActive,
  formatUsd,
  FLASH_SALE_PRICE_CENTS,
  ALL_ACCESS_PRICE_CENTS,
} from "@/lib/summerSale";
import { trackCTA } from "@/lib/analytics";

export default function SummerSaleBar() {
  if (!isSummerSaleActive()) return null;

  const flash = formatUsd(FLASH_SALE_PRICE_CENTS);
  const allAccess = formatUsd(ALL_ACCESS_PRICE_CENTS);

  return (
    <Link
      to="/products"
      onClick={() => trackCTA({ text: `Flash Sale ${flash} per product`, location: "promo_bar", destination: "/products" })}
      className="group block bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e]"
    >
      <div className="max-w-7xl mx-auto px-6 h-10 flex items-center justify-center gap-2 text-center text-xs sm:text-sm font-semibold">
        <Sparkles className="w-4 h-4 shrink-0" />
        <span>
          Flash Sale — <span className="font-extrabold">every product {flash}</span>, or get them all for{" "}
          <span className="font-extrabold">{allAccess}</span>.
        </span>
        <span className="hidden sm:inline-flex items-center gap-1 underline underline-offset-2 group-hover:gap-1.5 transition-all">
          Shop now <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
