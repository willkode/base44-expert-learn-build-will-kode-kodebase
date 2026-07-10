import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import BundleDownloadCard from "@/components/dashboard/BundleDownloadCard";
import LoadingState from "@/components/shared/LoadingState";
import Seo from "@/components/seo/Seo";
import { trackEvent } from "@/lib/analytics";

export default function BundleDownloads() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    base44.functions.invoke("getMyProducts", { bundleOnly: true })
      .then(({ data }) => {
        setProducts(data?.products || []);
        trackEvent("bundle_downloads_view", { product_count: data?.products?.length || 0 });
      })
      .catch((e) => setError(e?.response?.data?.error || "We couldn't load your bundle downloads."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading bundle downloads..." />;

  return (
    <div className="space-y-6">
      <Seo title="Complete Builder Bundle Downloads" path="/bundle-downloads" noindex />
      <Button variant="ghost" onClick={() => navigate("/dashboard")}><ArrowLeft className="w-4 h-4" /> Dashboard</Button>
      <div>
        <p className="text-sm font-semibold text-primary uppercase tracking-widest">Complete Builder Bundle</p>
        <h1 className="font-sora font-bold text-3xl mt-2">Your product downloads</h1>
        <p className="text-muted-foreground mt-2">Download every PDF included with your bundle.</p>
      </div>
      {error ? <div className="rounded-2xl border border-border bg-card p-8 text-center"><Package className="w-8 h-8 text-muted-foreground mx-auto mb-3" /><p>{error}</p></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => <BundleDownloadCard key={product.id} product={product} onDownload={(p) => navigate(`/download/${p.id}`)} />)}
        </div>
      )}
    </div>
  );
}