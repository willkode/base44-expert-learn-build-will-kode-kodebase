import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, Ticket, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartContext";
import { base44 } from "@/api/base44Client";
import LoadingState from "@/components/shared/LoadingState";
import { isSummerSaleActive, getProductSalePriceCents, formatUsd } from "@/lib/summerSale";
import { trackRemoveFromCart, trackEvent } from "@/lib/analytics";

export default function CartSheet() {
  const { items, removeItem, isOpen, setIsOpen, closeCart, coupon, setCoupon, clearCoupon } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [couponError, setCouponError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    base44.entities.Product.filter({ active: true }).then((all) => {
      setProducts(all);
      setLoading(false);
    });
  }, [isOpen]);

  const cartProducts = products.filter((p) => items.includes(p.id));
  const onSale = isSummerSaleActive();
  const priceFor = (p) => coupon?.prices?.[p.id] ?? getProductSalePriceCents(p.priceCents);
  const totalCents = cartProducts.reduce((sum, p) => sum + priceFor(p), 0);
  const fullTotalCents = cartProducts.reduce((sum, p) => sum + (p.priceCents || 0), 0);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplying(true);
    setCouponError(null);
    try {
      const res = await base44.functions.invoke("applyCoupon", { code: couponCode.trim(), productIds: items });
      if (res.data?.valid) {
        setCoupon({ code: res.data.code, prices: res.data.prices });
        setCouponCode("");
        trackEvent("coupon_applied", { code: res.data.code });
      } else {
        setCouponError(res.data?.error || "Invalid coupon code.");
      }
    } catch (e) {
      setCouponError(e?.response?.data?.error || "Could not apply this coupon. Please try again.");
    }
    setApplying(false);
  };

  const handleRemove = (p) => {
    trackRemoveFromCart({ id: p.id, name: p.name, category: p.category, price: p.priceCents / 100 });
    removeItem(p.id);
  };

  const handleCheckout = () => {
    closeCart();
    navigate("/checkout?cart=1");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-sora flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" /> Your Cart
            {items.length > 0 && <span className="text-sm font-normal text-muted-foreground">({items.length})</span>}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <ShoppingCart className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-4">Your cart is empty.</p>
            <Button variant="outline" onClick={() => { closeCart(); navigate("/products"); }}>
              Browse products
            </Button>
          </div>
        ) : loading && cartProducts.length === 0 ? (
          <LoadingState label="Loading your cart..." />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4 space-y-4">
              {cartProducts.map((p) => (
                <div key={p.id} className="flex gap-3 rounded-xl border border-border bg-card/60 p-3">
                  {p.imageUrl && (
                    <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm leading-snug">{p.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="font-sora font-bold text-sm">{formatUsd(priceFor(p))}</span>
                      {(onSale || coupon?.prices?.[p.id] != null) && priceFor(p) < (p.priceCents || 0) && (
                        <span className="text-xs text-muted-foreground line-through">{formatUsd(p.priceCents)}</span>
                      )}
                      {coupon?.prices?.[p.id] != null && (
                        <span className="text-[10px] font-semibold text-primary uppercase">{coupon.code}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(p)}
                    className="self-start p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-secondary/60 transition-colors"
                    aria-label={`Remove ${p.name} from cart`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              {coupon ? (
                <div className="flex items-center justify-between rounded-lg border border-primary/40 bg-primary/5 px-3 py-2">
                  <span className="flex items-center gap-1.5 text-sm font-medium">
                    <Ticket className="w-4 h-4 text-primary" /> Coupon {coupon.code} applied
                  </span>
                  <button
                    onClick={clearCoupon}
                    className="p-1 rounded text-muted-foreground hover:text-destructive"
                    aria-label="Remove coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(null); }}
                      onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                      placeholder="Coupon code"
                      className="h-9"
                    />
                    <Button variant="outline" onClick={applyCoupon} disabled={applying || !couponCode.trim()}>
                      {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                  {couponError && <p className="text-xs text-destructive">{couponError}</p>}
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="flex items-center gap-2">
                  {fullTotalCents > totalCents && (
                    <span className="text-muted-foreground line-through text-xs">{formatUsd(fullTotalCents)}</span>
                  )}
                  <span className="font-sora font-bold text-lg">{formatUsd(totalCents)}</span>
                </span>
              </div>
              <Button
                onClick={handleCheckout}
                size="lg"
                className="w-full font-semibold bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90"
              >
                Checkout
              </Button>
              <p className="text-[11px] text-muted-foreground text-center">Secure checkout powered by Square.</p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}