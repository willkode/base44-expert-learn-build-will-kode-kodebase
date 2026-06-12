import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import LoadingState from "@/components/shared/LoadingState";
import Seo from "@/components/seo/Seo";
import { trackSelectItem } from "@/lib/analytics";

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Product.filter({ active: true }, "order").then((items) => {
      setProducts(items);
      setLoading(false);
    });
  }, []);

  return (
    <div className="pt-28 pb-24 px-6">
      <Seo
        title="Products — Premium Prompt Packages"
        description="Professionally engineered prompt packages that build complete systems into your app. One-time fee, free support."
        path="/products"
        type="website"
      />
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-widest">Products</span>
          <h1 className="font-sora font-bold text-3xl md:text-5xl tracking-tight mt-4 mb-5">
            Premium prompt packages. <span className="text-gradient-orange">Buy once, build forever.</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Professionally engineered prompts that build complete systems into your app. One-time fee. Free support.
          </p>
        </div>

        {loading ? (
          <LoadingState label="Loading products..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card/60 overflow-hidden flex flex-col hover:border-primary/40 transition-all duration-300 hover:-translate-y-1"
              >
                {p.imageUrl && (
                  <img src={p.imageUrl} alt={p.name} className="w-full aspect-video object-cover" />
                )}
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">{p.category}</Badge>
                    {p.badge && (
                      <Badge className="text-xs bg-primary/15 text-primary border-primary/30 hover:bg-primary/15">
                        <Sparkles className="w-3 h-3 mr-1" /> {p.badge}
                      </Badge>
                    )}
                  </div>
                  <h2 className="font-sora font-bold text-xl mb-1.5">{p.name}</h2>
                  {p.tagline && <p className="text-sm text-muted-foreground mb-4">{p.tagline}</p>}
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {(p.features || []).map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <div className="flex items-end gap-1">
                        <span className="font-sora font-extrabold text-3xl">${(p.priceCents / 100).toFixed(p.priceCents % 100 === 0 ? 0 : 2)}</span>
                        <span className="text-muted-foreground mb-1 text-sm">one-time</span>
                      </div>
                      {p.supportNote && <p className="text-xs text-muted-foreground mt-1">{p.supportNote}</p>}
                    </div>
                    <Button
                      onClick={() => {
                        trackSelectItem({ id: p.id, name: p.name, category: p.category, price: p.priceCents / 100 });
                        navigate(`/checkout?product=${p.id}`);
                      }}
                      className="font-semibold bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90"
                    >
                      Buy Now
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}