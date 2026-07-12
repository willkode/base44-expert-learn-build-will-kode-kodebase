import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Sparkles, Crown, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trackSelectItem, trackAddToCart } from "@/lib/analytics";
import { useCart } from "@/components/cart/CartContext";
import { isSummerSaleActive, getProductSalePriceCents, getSaleDiscountPercent, formatUsd, SUMMER_SALE_END_LABEL } from "@/lib/summerSale";

const MotionLink = motion(Link);

export default function FeaturedBundleCard({ product: p }) {
  const navigate = useNavigate();
  const { addItem, openCart } = useCart();
  if (!p) return null;

  return (
    <MotionLink
      to={`/products/${p.slug}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="block rounded-2xl border-2 border-primary/40 bg-card/80 overflow-hidden mb-12 hover:border-primary/70 transition-all duration-300 hover:-translate-y-1 cursor-pointer glow-orange"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {p.imageUrl && (
          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover aspect-video lg:aspect-auto" />
        )}
        <div className="p-8 lg:p-10 flex flex-col">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge className="text-xs bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] border-0 hover:opacity-100">
              <Crown className="w-3 h-3 mr-1" /> FEATURED
            </Badge>
            <Badge variant="secondary" className="text-xs">{p.category}</Badge>
            {p.badge && (
              <Badge className="text-xs bg-primary/15 text-primary border-primary/30 hover:bg-primary/15">
                <Sparkles className="w-3 h-3 mr-1" /> {p.badge}
              </Badge>
            )}
          </div>
          <h2 className="font-sora font-bold text-2xl md:text-3xl mb-2">{p.name}</h2>
          {p.tagline && <p className="text-sm text-muted-foreground mb-5">{p.tagline}</p>}
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 mb-6 flex-1">
            {(p.features || []).map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              {isSummerSaleActive() ? (
                <>
                  <Badge className="mb-1.5 text-[10px] bg-primary/15 text-primary border-primary/30 hover:bg-primary/15">
                    Will's Birthday Sale · {getSaleDiscountPercent(p.slug)}% off
                  </Badge>
                  <div className="flex items-end gap-1.5">
                    <span className="font-sora font-extrabold text-4xl">{formatUsd(getProductSalePriceCents(p.priceCents, p.slug))}</span>
                    <span className="text-muted-foreground mb-1 text-sm line-through">{formatUsd(p.priceCents)}</span>
                    <span className="text-muted-foreground mb-1 text-sm">one-time</span>
                  </div>
                  <p className="text-xs text-primary mt-1">Sale ends {SUMMER_SALE_END_LABEL}</p>
                </>
              ) : (
                <div className="flex items-end gap-1">
                  <span className="font-sora font-extrabold text-4xl">{formatUsd(p.priceCents)}</span>
                  <span className="text-muted-foreground mb-1 text-sm">one-time</span>
                </div>
              )}
              {p.supportNote && <p className="text-xs text-muted-foreground mt-1">{p.supportNote}</p>}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/products/${p.slug}`);
                }}
                variant="outline"
              >
                Learn More
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  trackAddToCart({ id: p.id, name: p.name, category: p.category, price: p.priceCents / 100 });
                  addItem(p.id);
                  openCart();
                }}
                variant="outline"
              >
                <ShoppingCart className="w-4 h-4 mr-1.5" /> Add to Cart
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  trackSelectItem({ id: p.id, name: p.name, category: p.category, price: p.priceCents / 100 });
                  navigate(`/checkout?product=${p.id}`);
                }}
                size="lg"
                className="font-semibold bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90"
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MotionLink>
  );
}