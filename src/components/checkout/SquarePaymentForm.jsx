import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";

export default function SquarePaymentForm({ payload, amountLabel, onSuccess }) {
  const cardRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let cardInstance = null;

    const init = async () => {
      const res = await base44.functions.invoke("getSquareConfig", {});
      const { applicationId, locationId, environment } = res.data;

      const scriptUrl = environment === "production"
        ? "https://web.squarecdn.com/v1/square.js"
        : "https://sandbox.web.squarecdn.com/v1/square.js";

      if (!window.Square || window.__squareScriptUrl !== scriptUrl) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = scriptUrl;
          script.onload = () => { window.__squareScriptUrl = scriptUrl; resolve(); };
          script.onerror = () => reject(new Error("Could not load the payment form."));
          document.head.appendChild(script);
        });
      }
      if (cancelled) return;

      const payments = window.Square.payments(applicationId, locationId);
      cardInstance = await payments.card({
        style: {
          input: { color: "#f8fafc", fontSize: "15px" },
          ".input-container": { borderColor: "#2a3454", borderRadius: "10px" },
          ".input-container.is-focus": { borderColor: "#ef4444" },
          ".message-text": { color: "#94a3b8" },
          ".message-text.is-error": { color: "#f87171" },
        },
      });
      if (cancelled) { cardInstance.destroy(); return; }
      await cardInstance.attach("#square-card-container");
      cardRef.current = cardInstance;
      setReady(true);
    };

    init().catch((err) => { if (!cancelled) setError(err.message || "Could not load the payment form."); });
    return () => {
      cancelled = true;
      if (cardRef.current) { cardRef.current.destroy(); cardRef.current = null; }
      else if (cardInstance) cardInstance.destroy();
    };
  }, []);

  const handlePay = async () => {
    setError(null);
    setPaying(true);
    try {
      const result = await cardRef.current.tokenize();
      if (result.status !== "OK") {
        throw new Error(result.errors?.[0]?.message || "Card details are invalid.");
      }
      const res = await base44.functions.invoke("createSquarePayment", {
        sourceId: result.token,
        ...payload,
      });
      if (res.data?.error) throw new Error(res.data.error);
      onSuccess(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div>
      <div id="square-card-container" className="min-h-[90px]">
        {!ready && !error && (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading secure payment form...
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
      <Button
        onClick={handlePay}
        disabled={!ready || paying}
        className="w-full mt-4 font-semibold bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90"
      >
        {paying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
        Pay {amountLabel}
      </Button>
      <p className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" /> Payments processed securely by Square
      </p>
    </div>
  );
}