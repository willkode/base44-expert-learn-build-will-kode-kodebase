import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Download as DownloadIcon, Mail, CheckCircle2, Loader2, ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import LoadingState from "@/components/shared/LoadingState";
import Seo from "@/components/seo/Seo";
import { trackEvent } from "@/lib/analytics";
import HireWillKodeUpsell from "@/components/upsell/HireWillKodeUpsell";

export default function Download() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState(null);
  const [emailing, setEmailing] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [fileCount, setFileCount] = useState(0);
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [downloadingIdx, setDownloadingIdx] = useState(null);

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
          setFileCount(result.fileCount || 0);
          trackEvent("download_page_view", { item_id: productId, item_name: result.productName });
          // Fetch the signed file list so each file can be listed individually.
          if (result.deliversPdf) {
            setLoadingFiles(true);
            try {
              const dl = await base44.functions.invoke("getProductDownload", { productId });
              if (active && dl.data?.files?.length) setFiles(dl.data.files);
            } catch { /* surfaced when the user clicks a file */ }
            if (active) setLoadingFiles(false);
          }
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

  const triggerDownload = (url, name) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadOne = async (idx) => {
    const file = files[idx];
    if (!file) return;
    setDownloadingIdx(idx);
    // Signed URLs are time-limited; re-fetch a fresh one right before download.
    let fresh = file;
    try {
      const res = await base44.functions.invoke("getProductDownload", { productId });
      if (res.data?.files?.[idx]) fresh = res.data.files[idx];
      else if (res.data?.error) { setAccessError(res.data.error); setDownloadingIdx(null); return; }
    } catch (e) {
      setAccessError(e?.response?.data?.error || "Something went wrong preparing your download.");
      setDownloadingIdx(null);
      return;
    }
    trackEvent("file_download", { item_id: productId, item_name: product?.name, file_name: fresh.fileName });
    if (/ai drift control/i.test(product?.name || "")) {
      trackEvent("drift_control_pdf_download", { item_id: productId, item_name: product?.name });
    }
    triggerDownload(fresh.downloadUrl, fresh.fileName);
    setDownloadingIdx(null);
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
          <p className="text-muted-foreground text-sm mb-8">
            Download your file{fileCount > 1 ? "s" : ""} below, or send {fileCount > 1 ? "them" : "it"} to your email.
          </p>

          {loadingFiles ? (
            <div className="flex items-center justify-center py-4 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Preparing your files…
            </div>
          ) : (
            <div className="space-y-2.5 text-left">
              {files.map((f, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDownloadOne(idx)}
                  disabled={downloadingIdx !== null}
                  className="w-full flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3 hover:border-primary/50 hover:bg-secondary/70 transition-colors disabled:opacity-60"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium truncate flex-1">{f.fileName}</span>
                  {downloadingIdx === idx ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                  ) : (
                    <DownloadIcon className="w-4 h-4 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="mt-4">
            {emailSent ? (
              <p className="text-sm text-green-400 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Sent to {userEmail}
              </p>
            ) : (
              <Button onClick={handleEmail} disabled={emailing} variant="outline" size="lg" className="w-full">
                {emailing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                Email {fileCount > 1 ? "files" : "PDF"} to {userEmail}
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6">
          <HireWillKodeUpsell variant="download" />
        </div>

        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => {
              trackEvent("cta_view_products", { location: "download_page" });
              navigate("/products");
            }}
          >
            Explore more products
          </Button>
        </div>
      </div>
    </div>
  );
}