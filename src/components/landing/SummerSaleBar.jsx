import React from "react";
import { Link } from "react-router-dom";
import { Flag, ArrowRight } from "lucide-react";
import { isFlashSaleActive } from "@/lib/flashSale";
import { trackCTA } from "@/lib/analytics";

export default function SummerSaleBar() {
  if (!isFlashSaleActive()) return null;

  return (
    <Link
      to="/products"
      onClick={() => trackCTA({ text: "Flash Sale $2.50", location: "promo_bar", destination: "/products" })}
      className="group block bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e]"
    >
      <div className="max-w-7xl mx-auto px-6 h-10 flex items-center justify-center gap-2 text-center text-xs sm:text-sm font-semibold">
        <Flag className="w-4 h-4 shrink-0" />
        <span>
          America's 250th Birthday Flash Sale — <span className="font-extrabold">everything $2.50</span>. Ends 11:59pm CST tonight.
        </span>
        <span className="hidden sm:inline-flex items-center gap-1 underline underline-offset-2 group-hover:gap-1.5 transition-all">
          Shop now <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}