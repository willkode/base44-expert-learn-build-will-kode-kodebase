import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wrench, Plus, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useCart } from "@/components/cart/CartContext";
import { trackEvent } from "@/lib/analytics";

export const HIRE_WILL_KODE_SLUG = "hire-will-kode";

// $75 done-for-you upsell — shown in the cart and on the download page.
// variant="cart" adds it to the cart; variant="download" goes straight to checkout.
export default function HireWillKodeUpsell({ variant = "cart" }) {
  const navigate = useNavigate();
  const { items, addItem } = useCart();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    base44.entities.Product.filter({ slug: HIRE_WILL_KODE_SLUG, active: true }).then((p) => {
      setProduct(p[0] || null);
    });
  }, []);

  if (!product) return null;
  const inCart = items.includes(product.id);
  if (variant === "cart" && inCart) return null;

  const handleClick = () => {
    trackEvent("upsell_click", { upsell: HIRE_WILL_KODE_SLUG, location: variant });
    if (variant === "cart") {
      addItem(product.id);
    } else {
      navigate(`/checkout?product=${product.id}`);
    }
  };

  return (
    <div className="rounded-xl border border-primary/40 bg-gradient-to-br from-primary/10 to-transparent p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] flex items-center justify-center shrink-0">
          <Wrench className="w-4 h-4 text-[#0a0f1e]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-sora font-semibold text-sm leading-snug">
            Hire Will Kode — Done-For-You
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Will personally integrates your prompts or builds a new system with them. One-time <span className="text-foreground font-semibold">$75</span>.
          </p>
          <ul className="mt-2 space-y-1">
            {["Prompts integrated for you", "Or a new system built with them"].map((f) => (
              <li key={f} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Check className="w-3 h-3 text-primary shrink-0" /> {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Button
        onClick={handleClick}
        size="sm"
        className="w-full mt-3 font-semibold bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90"
      >
        {variant === "cart" ? (
          <><Plus className="w-4 h-4 mr-1" /> Add for $75</>
        ) : (
          <>Hire Will Kode — $75 <ArrowRight className="w-4 h-4 ml-1" /></>
        )}
      </Button>
    </div>
  );
}