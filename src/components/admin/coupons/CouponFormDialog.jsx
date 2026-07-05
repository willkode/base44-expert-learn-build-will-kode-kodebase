import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export default function CouponFormDialog({ open, onOpenChange, products, onSaved }) {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [singleUse, setSingleUse] = useState(true);
  const [selected, setSelected] = useState({}); // { productId: priceDollarsString }
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const toggleProduct = (p) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[p.id] !== undefined) delete next[p.id];
      else next[p.id] = ((p.priceCents || 0) / 100).toFixed(2);
      return next;
    });
  };

  const handleSave = async () => {
    setError(null);
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return setError("Enter a coupon code.");
    const entries = Object.entries(selected);
    if (entries.length === 0) return setError("Select at least one product.");
    const productPrices = [];
    for (const [productId, dollars] of entries) {
      const cents = Math.round(parseFloat(dollars) * 100);
      if (!Number.isFinite(cents) || cents < 0) return setError("Every selected product needs a valid price.");
      productPrices.push({ productId, priceCents: cents });
    }
    setSaving(true);
    const existing = await base44.entities.Coupon.filter({ code: cleanCode });
    if (existing.length > 0) {
      setSaving(false);
      return setError("A coupon with this code already exists.");
    }
    await base44.entities.Coupon.create({
      code: cleanCode,
      description: description.trim(),
      singleUse,
      active: true,
      productPrices,
      usedCount: 0,
    });
    trackEvent("admin_coupon_created", { code: cleanCode });
    setSaving(false);
    setCode(""); setDescription(""); setSingleUse(true); setSelected({});
    onOpenChange(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-sora">New coupon</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Coupon code</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. FRIEND50"
              maxLength={30}
            />
          </div>
          <div className="space-y-2">
            <Label>Description (internal)</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. One-time deal for podcast listener" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={singleUse} onCheckedChange={setSingleUse} />
            Single use — deactivates after the first purchase
          </label>
          <div className="space-y-2">
            <Label>Products & coupon prices</Label>
            <p className="text-xs text-muted-foreground">Select products and set the exact price the buyer pays with this coupon.</p>
            <div className="space-y-2 max-h-64 overflow-y-auto rounded-lg border border-border p-2">
              {products.map((p) => {
                const checked = selected[p.id] !== undefined;
                return (
                  <div key={p.id} className={`flex items-center gap-3 rounded-lg p-2 ${checked ? "bg-primary/5 border border-primary/40" : "border border-transparent"}`}>
                    <Checkbox checked={checked} onCheckedChange={() => toggleProduct(p)} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">Regular ${((p.priceCents || 0) / 100).toFixed(2)}</p>
                    </div>
                    {checked && (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">$</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={selected[p.id]}
                          onChange={(e) => setSelected((prev) => ({ ...prev, [p.id]: e.target.value }))}
                          className="w-24 h-8"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleSave} disabled={saving} className="w-full font-semibold">
            {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
            Create coupon
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}