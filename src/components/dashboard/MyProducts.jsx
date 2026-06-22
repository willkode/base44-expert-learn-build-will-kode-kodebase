import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { trackEvent } from "@/lib/analytics";

// Shows products the logged-in user has purchased (completed Payment with a
// productId) so they can jump straight to their download. Reuses the existing
// /download/:productId page, which re-verifies access server-side.
export default function MyProducts({ userId }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    let active = true;
    (async () => {
      try {
        const payments = await base44.entities.Payment.filter(
          { userId, status: "completed" },
          "-created_date",
          200
        );
        const productIds = [...new Set(payments.map((p) => p.productId).filter(Boolean))];
        if (productIds.length === 0) {
          if (active) { setProducts([]); setLoading(false); }
          return;
        }
        const all = await base44.entities.Product.list("-created_date", 200);
        const owned = all.filter((p) => productIds.includes(p.id));
        if (active) { setProducts(owned); setLoading(false); }
      } catch {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [userId]);

  if (loading || products.length === 0) return null;

  const handleOpen = (product) => {
    trackEvent("my_products_open", { item_id: product.id, item_name: product.name });
    navigate(`/download/${product.id}`);
  };

  return (
    <section>
      <h2 className="font-sora font-semibold text-lg mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-primary" /> My Products
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl border border-border bg-card/60 p-5 flex flex-col"
          >
            <div className="flex items-start gap-3 mb-4">
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-border"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6 text-primary" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-sm leading-snug">{p.name}</p>
                {p.tagline && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{p.tagline}</p>
                )}
              </div>
            </div>
            <Button
              onClick={() => handleOpen(p)}
              size="sm"
              className="mt-auto w-full font-semibold bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90"
            >
              {p.deliversPdf ? (
                <><Download className="w-3.5 h-3.5 mr-1.5" /> Download</>
              ) : (
                <>Open <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></>
              )}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}