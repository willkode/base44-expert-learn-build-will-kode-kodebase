import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Ticket, Trash2 } from "lucide-react";
import LoadingState from "@/components/shared/LoadingState";
import CouponFormDialog from "@/components/admin/coupons/CouponFormDialog";
import { formatUsd } from "@/lib/summerSale";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = useCallback(async () => {
    const [c, p] = await Promise.all([
      base44.entities.Coupon.list("-created_date", 200),
      base44.entities.Product.filter({ active: true }),
    ]);
    setCoupons(c);
    setProducts(p.filter((x) => (x.priceCents || 0) > 0));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const productName = (id) => products.find((p) => p.id === id)?.name || "Unknown product";

  const toggleActive = async (coupon) => {
    setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? { ...c, active: !coupon.active } : c)));
    await base44.entities.Coupon.update(coupon.id, { active: !coupon.active });
  };

  const remove = async (coupon) => {
    if (!window.confirm(`Delete coupon ${coupon.code}? This cannot be undone.`)) return;
    setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
    await base44.entities.Coupon.delete(coupon.id);
  };

  if (loading) return <LoadingState label="Loading coupons..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-sora font-bold text-2xl flex items-center gap-2">
            <Ticket className="w-6 h-6 text-primary" /> Coupons
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            One-time coupon codes with a custom price per product. Applied in the cart before Square checkout.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> New coupon
        </Button>
      </div>

      {coupons.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <Ticket className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No coupons yet. Create your first one-time coupon.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((c) => {
            const used = c.singleUse !== false && (c.usedCount || 0) > 0;
            return (
              <div key={c.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-sora font-bold text-lg tracking-wide">{c.code}</span>
                      {used ? (
                        <Badge variant="secondary">Used</Badge>
                      ) : c.active === false ? (
                        <Badge variant="outline">Disabled</Badge>
                      ) : (
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-transparent hover:bg-emerald-500/15">Active</Badge>
                      )}
                      {c.singleUse !== false && <Badge variant="outline">Single use</Badge>}
                    </div>
                    {c.description && <p className="text-sm text-muted-foreground mt-1">{c.description}</p>}
                    {used && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Redeemed{c.usedBy ? ` by ${c.usedBy}` : ""}{c.usedAt ? ` on ${new Date(c.usedAt).toLocaleDateString()}` : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Switch checked={c.active !== false && !used} disabled={used} onCheckedChange={() => toggleActive(c)} />
                      {used ? "Used" : c.active !== false ? "On" : "Off"}
                    </label>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => remove(c)}
                      aria-label={`Delete coupon ${c.code}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(c.productPrices || []).map((o) => (
                    <span key={o.productId} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/40 px-2.5 py-1 text-xs">
                      <span className="truncate max-w-[220px]">{productName(o.productId)}</span>
                      <span className="font-sora font-bold text-primary">{formatUsd(o.priceCents)}</span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CouponFormDialog open={dialogOpen} onOpenChange={setDialogOpen} products={products} onSaved={load} />
    </div>
  );
}