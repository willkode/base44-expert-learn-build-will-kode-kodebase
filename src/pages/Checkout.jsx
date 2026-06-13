import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/plans";
import { base44 } from "@/api/base44Client";
import SquarePaymentForm from "@/components/checkout/SquarePaymentForm";
import LoadingState from "@/components/shared/LoadingState";
import { trackBeginCheckout, trackPurchase } from "@/lib/analytics";

export default function Checkout() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get("plan");
  const productId = urlParams.get("product");
  const plan = planId ? PLANS[planId] : null;
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(!!productId);
  const [done, setDone] = useState(null);

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
    if (plan) {
      trackBeginCheckout({ id: planId, name: `${plan.name} plan`, category: "subscription", price: parseFloat(plan.price.replace("$", "")) || 0 });
    } else if (product) {
      trackBeginCheckout({ id: product.id, name: product.name, category: product.category, price: product.priceCents / 100 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId, product?.id]);

  const handlePaymentSuccess = (data) => {
    trackPurchase({
      transactionId: data?.paymentId || data?.squarePaymentId || undefined,
      id: plan ? planId : product?.id,
      name: plan ? `${plan.name} plan` : product?.name,
      category: plan ? "subscription" : product?.category,
      price: plan ? parseFloat(plan.price.replace("$", "")) || 0 : product ? product.priceCents / 100 : 0,
    });
    if (product && product.deliversPdf) {
      navigate(`/download/${product.id}`);
      return;
    }
    setDone(data);
  };

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState label="Loading checkout..." />
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
        payload: { planId },
      }
    : product
    ? {
        name: product.name,
        desc: product.tagline,
        priceLabel: `$${(product.priceCents / 100).toFixed(product.priceCents % 100 === 0 ? 0 : 2)}`,
        periodLabel: " one-time",
        features: product.features || [],
        supportNote: product.supportNote,
        backTo: "/products",
        backLabel: "Back to products",
        payload: { productId },
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
          {done.receiptUrl && (
            <a href={done.receiptUrl} target="_blank" rel="noreferrer" className="block text-sm text-primary hover:underline mb-4">
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
            <div className="flex items-end gap-1 mb-2">
              <span className="font-sora font-extrabold text-4xl">{item.priceLabel}</span>
              <span className="text-muted-foreground mb-1.5">{item.periodLabel}</span>
            </div>
            {item.supportNote && <p className="text-xs text-muted-foreground mb-4">{item.supportNote}</p>}
            <ul className="space-y-2.5 mt-4">
              {item.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="font-sora font-bold text-xl mb-5">Payment details</h2>
            <SquarePaymentForm
              payload={item.payload}
              amountLabel={`${item.priceLabel}${plan ? item.periodLabel : ""}`}
              onSuccess={handlePaymentSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  );
}