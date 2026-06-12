import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/plans";
import SquarePaymentForm from "@/components/checkout/SquarePaymentForm";

export default function Checkout() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get("plan") || "pro";
  const plan = PLANS[planId];
  const [done, setDone] = useState(null);

  if (!plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">That plan doesn't exist.</p>
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
          <h1 className="font-sora font-bold text-2xl mb-2">You're on {plan.name}!</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Your payment went through and your plan is active.
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
        <button onClick={() => navigate("/pricing")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to pricing
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-border bg-card/60 p-8">
            <h2 className="font-sora font-bold text-xl mb-1">{plan.name} plan</h2>
            <p className="text-sm text-muted-foreground mb-5">{plan.desc}</p>
            <div className="flex items-end gap-1 mb-6">
              <span className="font-sora font-extrabold text-4xl">{plan.price}</span>
              <span className="text-muted-foreground mb-1.5">{plan.period}</span>
            </div>
            <ul className="space-y-2.5">
              {plan.features.map((f) => (
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
              planId={planId}
              amountLabel={`${plan.price}${plan.period}`}
              onSuccess={setDone}
            />
          </div>
        </div>
      </div>
    </div>
  );
}