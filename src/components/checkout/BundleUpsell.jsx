import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getProductSalePriceCents, formatUsd } from "@/lib/summerSale";
import { trackEvent } from "@/lib/analytics";

// Order bump shown on the checkout page for single-product purchases —
// offers a one-click switch to the Complete Builder Bundle.
export default function BundleUpsell({ currentProductId }) {
  const navigate = useNavigate();
  const [bundle, setBundle] = useState(null);

  useEffect(() => {
    base44.entities.Product.filter({ slug: "complete-builder-bundle", active: true })
      .then((items) => setBundle(items[0] || null))
      .catch(() => {});
  }, []);

  if (!bundle || bundle.id === currentProductId) return null;

  const price = formatUsd(getProductSalePriceCents(bundle.priceCents));
  const upgrade = () => {
    trackEvent("bundle_upsell_click", { from_product_id: currentProductId });
    navigate(`/checkout?product=${bundle.id}`);
  };

  return (
    <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <Layers className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-semibold">Want everything instead?</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        The <span className="text-foreground font-medium">Complete Builder Bundle</span> includes
        every KodeBase product — for {price} total.
      </p>
      <button
        onClick={upgrade}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
      >
        Switch to the bundle — {price} <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}