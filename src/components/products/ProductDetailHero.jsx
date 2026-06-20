import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function ProductDetailHero({ product, onBuy }) {
  const price = `$${(product.priceCents / 100).toFixed(product.priceCents % 100 === 0 ? 0 : 2)}`;
  const [vaultCount, setVaultCount] = useState(null);

  useEffect(() => {
    if (product.slug === "prompt-vault") {
      base44.entities.VaultPrompt.filter({ published: true }, "order", 200)
        .then((prompts) => setVaultCount(prompts.length));
    }
  }, [product.slug]);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="text-xs">{product.category}</Badge>
          {product.badge && (
            <Badge className="text-xs bg-primary/15 text-primary border-primary/30 hover:bg-primary/15">
              <Sparkles className="w-3 h-3 mr-1" /> {product.badge}
            </Badge>
          )}
        </div>
        <h1 className="font-sora font-bold text-4xl md:text-5xl tracking-tight mb-5">
          {product.name.replace(" Pro", "")} <span className="text-gradient-orange">Pro</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          {product.slug === "prompt-vault" && vaultCount !== null
            ? product.tagline?.replace(/\d+\+?\s*prompt/i, `${vaultCount}+ prompt`) || product.tagline
            : product.tagline}
          {product.slug === "prompt-vault" && vaultCount !== null && (
            <span className="block mt-2 text-sm font-semibold text-primary">{vaultCount} prompts available now</span>
          )}
        </p>
        <div className="flex items-end gap-2 mb-2">
          <span className="font-sora font-extrabold text-5xl">{price}</span>
          <span className="text-muted-foreground mb-2">one-time</span>
        </div>
        {product.supportNote && <p className="text-sm text-muted-foreground mb-6">{product.supportNote}</p>}
        <Button
          size="lg"
          onClick={onBuy}
          className="font-semibold text-base px-8 bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90"
        >
          Buy Now — {price}
        </Button>
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
          <Lock className="w-3 h-3" /> Secure checkout powered by Square
        </p>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
        {product.imageUrl && (
          <img src={product.imageUrl} alt={product.name} className="w-full rounded-2xl border border-border glow-orange" />
        )}
      </motion.div>
    </div>
  );
}