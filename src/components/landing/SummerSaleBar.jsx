import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { isSummerSaleActive, SUMMER_SALE_END_LABEL } from "@/lib/summerSale";
import { trackCTA } from "@/lib/analytics";

export default function SummerSaleBar() {
  if (!isSummerSaleActive()) return null;

  return (
    <Link
      to="/products"
      onClick={() => trackCTA({ text: "Summer Sale 50% off", location: "promo_bar", destination: "/products" })}
      className="group block bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e]"
    >
      <div className="max-w-7xl mx-auto px-6 h-10 flex items-center justify-center gap-2 text-center text-xs sm:text-sm font-semibold">
        <Sparkles className="w-4 h-4 shrink-0" />
        <span>
          Summer Sale — <span className="font-extrabold">50% off all products</span>. Ends {SUMMER_SALE_END_LABEL}.
        </span>
        <span className="hidden sm:inline-flex items-center gap-1 underline underline-offset-2 group-hover:gap-1.5 transition-all">
          Shop now <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}