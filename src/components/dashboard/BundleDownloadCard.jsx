import React from "react";
import { Download, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BundleDownloadCard({ product, onDownload }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5 flex flex-col">
      <div className="flex items-start gap-3 mb-4">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-border" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
            <Package className="w-6 h-6 text-primary" />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="font-semibold text-sm leading-snug">{product.name}</h2>
          {product.tagline && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{product.tagline}</p>}
        </div>
      </div>
      <Button onClick={() => onDownload(product)} size="sm" className="mt-auto w-full font-semibold">
        <Download className="w-4 h-4" /> Download PDF{product.fileCount > 1 ? "s" : ""}
      </Button>
    </div>
  );
}