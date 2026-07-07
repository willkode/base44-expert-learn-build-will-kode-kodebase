import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

export default function ProductsCtaBanner({
  location = "banner",
  title = "Want the full system?",
  description = "Ready-made prompt packs and complete systems that take your app from idea to launch.",
}) {
  return (
    <div className="rounded-2xl border border-primary/30 bg-card/70 p-6 md:p-8 flex flex-col md:flex-row items-center gap-5 glow-orange">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <ShoppingBag className="w-6 h-6 text-primary" />
      </div>
      <div className="flex-1 text-center md:text-left">
        <h3 className="font-sora font-bold text-lg mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <Button
        asChild
        className="shrink-0 font-semibold gap-2 bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] hover:opacity-90 text-white border-0"
      >
        <Link to="/products" onClick={() => trackEvent("cta_view_products", { location })}>
          View products <ArrowRight className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  );
}