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

        // Access is resolved entirely server-side (service role) so admin-granted
        // purchases are matched the same way the dashboard does. The Payment
        // record can also lag a few seconds behind the Square webhook, so we poll.
        let result = null;
        for (let attempt = 0; attempt < 8 && active; attempt++) {
          // The probe returns 403 (no completed purchase yet) or 404 (product
          // missing). Axios throws on those, so read the body from the error.
          let data, statusCode;
          try {
            const res = await base44.functions.invoke("getProductDownload", { productId, checkOnly: true });
            data = res.data; statusCode = res.status;
          } catch (e) {
            data = e?.response?.data; statusCode = e?.response?.status;
          }
          if (data?.hasAccess) { result = data; break; }
          // A non-access error (e.g. product missing) shouldn't be retried.
          if (data?.error && statusCode !== 403) { result = data; break; }
          await new Promise((r) => setTimeout(r, 2500));
        }
        if (!active) return;

        if (result?.hasAccess) {
          setProduct({ name: result.productName, deliversPdf: result.deliversPdf });
          trackEvent("download_page_view", { item_id: productId, item_name: result.productName });
        } else if (result?.error) {
          setAccessError(result.error);
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
    let res;
    try {
      res = await base44.functions.invoke("getProductDownload", { productId });
    } catch (e) {
      setAccessError(e?.response?.data?.error || "Something went wrong preparing your download.");
      return;
    }
    if (res.data?.error) { setAccessError(res.data.error); return; }
    trackEvent("file_download", { item_id: productId, item_name: product?.name });
    if (/ai drift control/i.test(product?.name || "")) {
      trackEvent("drift_control_pdf_download", { item_id: productId, item_name: product?.name });
    }
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
    let res;
    try {
      res = await base44.functions.invoke("getProductDownload", { productId, sendEmail: true });
    } catch (e) {
      setEmailing(false);
      setAccessError(e?.response?.data?.error || "Something went wrong sending your email.");
      return;
    }
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