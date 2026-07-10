import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { formatUsd } from "@/lib/summerSale";

// Landing section for the Complete Builder Bundle — lists every included
// product dynamically so it always stays in sync with the catalog.
export default function CompleteBundleDetails({ bundlePriceCents }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    base44.entities.Product.filter({ active: true }, "order", 100)
      .then((all) =>
        setItems(
          all.filter((p) => p.slug !== "complete-builder-bundle" && p.slug !== "complete-base44-knowledge-kit" && (p.priceCents || 0) > 0)
        )
      )
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  const totalCents = items.reduce((sum, p) => sum + (p.priceCents || 0), 0);
  const savingsCents = Math.max(0, totalCents - (bundlePriceCents || 0));

  return (
    <div className="mt-24">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">What's Included</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-4">
          Every product. <span className="text-gradient-orange">One price.</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          {items.length} products worth {formatUsd(totalCents)} bought separately — you save {formatUsd(savingsCents)}.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
            className="rounded-xl border border-border bg-card/50 p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Package className="w-4 h-4" />
              </span>
              <span className="text-sm text-muted-foreground line-through">{formatUsd(p.priceCents)}</span>
            </div>
            <p className="font-semibold text-sm mb-1">{p.name}</p>
            {p.tagline && <p className="text-xs text-muted-foreground line-clamp-2">{p.tagline}</p>}
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-green-400 font-medium">
              <Check className="w-3.5 h-3.5" /> Included in the bundle
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}