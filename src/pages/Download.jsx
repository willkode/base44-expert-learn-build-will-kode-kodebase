import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Download as DownloadIcon, Mail, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import LoadingState from "@/components/shared/LoadingState";
import Seo from "@/components/seo/Seo";
import { trackEvent } from "@/lib/analytics";

export default function Download() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState(null);
  const [emailing, setEmailing] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await base44.auth.me();
        if (active) setUserEmail(me.email);
        const products = await base44.entities.Product.filter({ id: productId });
        if (!active) return;
        const p = products[0];
        if (!p) {
          setAccessError("We couldn't find that product.");
          return;
        }
        setProduct(p);

        // The Payment record is written asynchronously by the Square webhook,
        // which can lag a few seconds behind the post-checkout redirect.
        // Poll for a completed purchase before showing the "unavailable" state.
        let found = false;
        for (let attempt = 0; attempt < 8 && active; attempt++) {
          const payments = await base44.entities.Payment.filter({
            userId: me.id,
            productId,
            status: "completed",
          });
          if (payments.length > 0) { found = true; break; }
          await new Promise((r) => setTimeout(r, 2500));
        }
        if (!active) return;
        if (found) {
          trackEvent("download_page_view", { item_id: productId, item_name: p.name });
        } else {
          setAccessError("We couldn't find a completed purchase for this product on your account yet. If you just paid, please wait a moment and refresh.");
        }
      } catch (err) {
        if (active) setAccessError("Something went wrong loading your download.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [productId]);

  const handleDownload = async () => {
    const res = await base44.functions.invoke("getProductDownload", { productId });
    if (res.data?.error) { setAccessError(res.data.error); return; }
    trackEvent("file_download", { item_id: productId, item_name: product?.name });
    const link = document.createElement("a");
    link.href = res.data.downloadUrl;
    link.download = res.data.fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEmail = async () => {
    setEmailing(true);
    const res = await base44.functions.invoke("getProductDownload", { productId, sendEmail: true });
    setEmailing(false);
    if (res.data?.error) { setAccessError(res.data.error); return; }
    trackEvent("download_emailed", { item_id: productId, item_name: product?.name });
    setEmailSent(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState label="Loading your download..." />
      </div>
    );
  }

  if (accessError) {
    return (
      <div className="min-h-screen bg-background blueprint-grid flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="font-sora font-bold text-2xl mb-2">Download unavailable</h1>
          <p className="text-muted-foreground text-sm mb-6">{accessError}</p>
          <Button onClick={() => navigate("/products")} className="w-full">Browse products</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background blueprint-grid px-6 py-16">
      <Seo title={`Download — ${product.name}`} path={`/download/${productId}`} type="website" />
      <div className="max-w-lg mx-auto">
        <button onClick={() => navigate("/dashboard")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </button>

        <div className="rounded-2xl border border-border bg-card p-8 glow-orange text-center">
          <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto mb-4" />
          <h1 className="font-sora font-bold text-2xl mb-2">You're all set!</h1>
          <p className="text-muted-foreground text-sm mb-1">
            Your purchase of <span className="text-foreground font-medium">{product.name}</span> is complete.
          </p>
          <p className="text-muted-foreground text-sm mb-8">Download your PDF below, or send it to your email.</p>

          <Button
            onClick={handleDownload}
            size="lg"
            className="w-full font-semibold bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90"
          >
            <DownloadIcon className="w-4 h-4 mr-2" /> Download PDF
          </Button>

          <div className="mt-4">
            {emailSent ? (
              <p className="text-sm text-green-400 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Sent to {userEmail}
              </p>
            ) : (
              <Button onClick={handleEmail} disabled={emailing} variant="outline" size="lg" className="w-full">
                {emailing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                Email PDF to {userEmail}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}