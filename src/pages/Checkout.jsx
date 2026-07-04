import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/plans";
import { base44 } from "@/api/base44Client";
import LoadingState from "@/components/shared/LoadingState";
import BundleUpsell from "@/components/checkout/BundleUpsell";
import { trackBeginCheckout, trackPurchase } from "@/lib/analytics";
import { isSummerSaleActive, getProductSalePriceCents, formatUsd, SUMMER_SALE_END_LABEL } from "@/lib/summerSale";
import { isFlashSaleActive, getFlashSalePriceCents } from "@/lib/flashSale";

export default function Checkout() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get("plan");
  const productId = urlParams.get("product");
  const status = urlParams.get("status"); // "success" when returning from Square
  const plan = planId ? PLANS[planId] : null;
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(!!productId);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(null);
  const [confirming, setConfirming] = useState(status === "success");

  useEffect(() => {
    if (productId) {
      base44.entities.Product.filter({ id: productId }).then((items) => {
        setProduct(items[0] || null);
        setLoadingProduct(false);
      });
    }
  }, [productId]);

  // GA4: begin_checkout once the item is known
  useEffect(() => {
    if (status === "success") return;
    if (plan) {
      trackBeginCheckout({ id: planId, name: `${plan.name} plan`, category: "subscription", price: parseFloat(plan.price.replace("$", "")) || 0 });
    } else if (product) {
      const price = isFlashSaleActive() ? getFlashSalePriceCents(product.priceCents) : getProductSalePriceCents(product.priceCents);
      trackBeginCheckout({ id: product.id, name: product.name, category: product.category, price: price / 100 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId, product?.id]);

  // Returning from Square's hosted checkout — poll for the Payment record the
  // webhook creates, then route to download/success.
  useEffect(() => {
    if (status !== "success") return;
    let active = true;
    let attempts = 0;

    const poll = async () => {
      attempts += 1;
      try {
        const me = await base44.auth.me();
        const query = { userId: me.id, status: "completed" };
        if (productId) query.productId = productId;
        else if (planId) query.planId = planId;
        const payments = await base44.entities.Payment.filter(query, "-created_date", 1);
        if (!active) return;
        if (payments.length > 0) {
          const pay = payments[0];
          trackPurchase({
            transactionId: pay.squarePaymentId || undefined,
            id: plan ? planId : product?.id || productId,
            name: plan ? `${plan.name} plan` : pay.itemName,
            category: plan ? "subscription" : product?.category,
            price: (pay.amountCents || 0) / 100,
          });
          if (productId) {
            // Product purchases land on the dashboard, where My Products lists
            // everything they own with download access.
            navigate(`/dashboard?purchase=success&item=${encodeURIComponent(product?.name || pay.itemName || "")}`);
            return;
          }
          setDone(pay);
          setConfirming(false);
          return;
        }
      } catch (_e) { /* keep polling */ }
      if (attempts >= 15) {
        if (active) { setConfirming(false); setError("pending"); }
        return;
      }
      if (active) setTimeout(poll, 2000);
    };
    poll();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, product?.id]);

  const startCheckout = async () => {
    setRedirecting(true);
    setError(null);
    // Free products skip Square entirely — access is granted server-side.
    if (product && (product.priceCents || 0) === 0) {
      const res = await base44.functions.invoke("claimFreeProduct", { productId });
      if (res.data?.success) {
        navigate(`/dashboard?purchase=success&item=${encodeURIComponent(product.name)}`);
      } else {
        setRedirecting(false);
        setError(res.data?.error || "Could not claim this product. Please try again.");
      }
      return;
    }
    const returnUrl = `${window.location.origin}/checkout?${planId ? `plan=${planId}` : `product=${productId}`}&status=success`;
    const res = await base44.functions.invoke("createSquareCheckoutLink", {
      planId: planId || undefined,
      productId: productId || undefined,
      redirectUrl: returnUrl,
    });
    if (res.data?.checkoutUrl) {
      window.location.href = res.data.checkoutUrl;
    } else {
      setRedirecting(false);
      setError(res.data?.error || "Could not start checkout. Please try again.");
    }
  };

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState label="Loading checkout..." />
      </div>
    );
  }

  // Confirming a payment after returning from Square
  if (confirming) {
    return (
      <div className="min-h-screen bg-background blueprint-grid flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center">
          <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <h1 className="font-sora font-bold text-2xl mb-2">Confirming your payment…</h1>
          <p className="text-muted-foreground text-sm">This only takes a moment.</p>
        </div>
      </div>
    );
  }

  const item = plan
    ? {
        name: `${plan.name} plan`,
        desc: plan.desc,
        priceLabel: plan.price,
        periodLabel: plan.period,
        features: plan.features,
        backTo: "/pricing",
        backLabel: "Back to pricing",
      }
    : product
    ? {
        name: product.name,
        desc: product.tagline,
        priceLabel: (product.priceCents || 0) === 0 ? "Free" : formatUsd(isFlashSaleActive() ? getFlashSalePriceCents(product.priceCents) : getProductSalePriceCents(product.priceCents)),
        fullPriceLabel: formatUsd(product.priceCents),
        onSale: (isFlashSaleActive() || isSummerSaleActive()) && (product.priceCents || 0) > 0,
        isFlashSale: isFlashSaleActive() && (product.priceCents || 0) > 0,
        periodLabel: " one-time",
        features: product.features || [],
        supportNote: product.supportNote,
        backTo: "/products",
        backLabel: "Back to products",
      }
    : null;

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">We couldn't find that item.</p>
          <Button onClick={() => navigate("/pricing")}>View plans</Button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background blueprint-grid flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center">
          <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto mb-4" />
          <h1 className="font-sora font-bold text-2xl mb-2">
            {plan ? `You're on ${plan.name}!` : `You've got ${item.name}!`}
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            {plan
              ? "Your payment went through and your plan is active."
              : "Your payment went through. We'll be in touch with your purchase details — and support is always free."}
          </p>
          {done.squareReceiptUrl && (
            <a href={done.squareReceiptUrl} target="_blank" rel="noreferrer" className="block text-sm text-primary hover:underline mb-4">
              View receipt
            </a>
          )}
          <Button onClick={() => navigate("/dashboard")} className="w-full font-semibold bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90">
            Go to dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Payment didn't reconcile in time after returning from Square
  if (error === "pending") {
    return (
      <div className="min-h-screen bg-background blueprint-grid flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center">
          <CheckCircle2 className="w-14 h-14 text-amber-400 mx-auto mb-4" />
          <h1 className="font-sora font-bold text-2xl mb-2">Payment received</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Thanks! We're still finalizing your purchase. It may take a minute to appear on your account — check your dashboard shortly.
          </p>
          <Button onClick={() => navigate("/dashboard")} className="w-full">Go to dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background blueprint-grid px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(item.backTo)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> {item.backLabel}
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-border bg-card/60 p-8">
            <h2 className="font-sora font-bold text-xl mb-1">{item.name}</h2>
            {item.desc && <p className="text-sm text-muted-foreground mb-5">{item.desc}</p>}
            {(planId === "pro" || planId === "pro_annual") && (
              <div className="flex gap-2 mb-5">
                <button
                  onClick={() => navigate("/checkout?plan=pro", { replace: true })}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${planId === "pro" ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}
                >
                  Monthly · $25/mo
                </button>
                <button
                  onClick={() => navigate("/checkout?plan=pro_annual", { replace: true })}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${planId === "pro_annual" ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}
                >
                  Annual · $250/yr
                  <span className="block font-normal text-[10px] text-primary">2 months free</span>
                </button>
              </div>
            )}
            <div className="flex items-end gap-2 mb-2">
              <span className="font-sora font-extrabold text-4xl">{item.priceLabel}</span>
              {item.onSale && <span className="text-muted-foreground mb-1.5 text-xl line-through">{item.fullPriceLabel}</span>}
              <span className="text-muted-foreground mb-1.5">{item.periodLabel}</span>
            </div>
            {item.onSale && (
              <p className="text-xs text-primary mb-1">
                {item.isFlashSale ? "🎆 Flash Sale · $2.50 · ends 11:59pm CST tonight" : `Summer Special · 50% off · ends ${SUMMER_SALE_END_LABEL}`}
              </p>
            )}
            {item.supportNote && <p className="text-xs text-muted-foreground mb-4">{item.supportNote}</p>}
            <ul className="space-y-2.5 mt-4">
              {item.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {product && (product.priceCents || 0) > 0 && product.slug !== "complete-builder-bundle" && (
              <BundleUpsell currentProductId={product.id} />
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 flex flex-col">
            <h2 className="font-sora font-bold text-xl mb-2">Secure checkout</h2>
            <p className="text-sm text-muted-foreground mb-6">
              You'll be taken to Square's secure, hosted checkout to complete your payment. Your card details never touch our servers.
            </p>

            <div className="rounded-xl border border-border bg-background/40 p-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total due</span>
                <span className="font-sora font-bold text-lg">{item.priceLabel}{plan ? item.periodLabel : ""}</span>
              </div>
            </div>

            {error && error !== "pending" && (
              <p className="text-sm text-destructive mb-4">{error}</p>
            )}

            <Button
              onClick={startCheckout}
              disabled={redirecting}
              size="lg"
              className="w-full mt-auto font-semibold bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90"
            >
              {redirecting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {product && (product.priceCents || 0) === 0 ? "Claiming…" : "Redirecting to Square…"}</>
              ) : product && (product.priceCents || 0) === 0 ? (
                <>Claim for free</>
              ) : (
                <>Continue to payment <ExternalLink className="w-4 h-4 ml-2" /></>
              )}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center mt-3">Payments securely processed by Square.</p>
          </div>
        </div>
      </div>
    </div>
  );
}