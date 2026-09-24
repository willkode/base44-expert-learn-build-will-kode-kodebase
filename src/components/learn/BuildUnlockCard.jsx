import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Check } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { formatUsd } from "@/lib/summerSale";
import { Button } from "@/components/ui/button";

// $5 lifetime unlock card for Build Your Own. `access` is the non-access
// response from getBuildYourOwn / getBuildGuide ({ signedIn, product, total, categoryCount }).
export default function BuildUnlockCard({ access, returnPath, className = "" }) {
  const navigate = useNavigate();
  const price = formatUsd(access.product?.priceCents ?? 500);
  const canBuy = access.total > 0 && access.product?.active;

  const unlock = () => {
    trackEvent("build_your_own_unlock_click", { signed_in: access.signedIn, page_path: returnPath });
    if (!access.signedIn) { navigate(`/register?next=${encodeURIComponent(returnPath)}`); return; }
    navigate(`/checkout?product=${access.product.id}`);
  };

  return (
    <div className={`max-w-xl mx-auto rounded-2xl border border-primary/40 bg-card/80 p-8 text-center glow-orange ${className}`}>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs font-medium text-primary mb-5">
        <Lock className="w-3.5 h-3.5" /> Members only
      </div>
      <p className="font-sora font-extrabold text-5xl mb-1">{price}</p>
      <p className="text-muted-foreground mb-6">One-time payment · Lifetime access · No subscription</p>
      <ul className="text-sm text-left space-y-2 max-w-sm mx-auto mb-7">
        {[
          access.total > 0
            ? `${access.total.toLocaleString()} build guides across ${access.categoryCount} categories`
            : "Hundreds of build guides",
          "KodeBase breakdowns: concepts, prerequisites and a step-by-step roadmap",
          "Search and filter by category and programming language",
          "New guides added over time — included forever",
        ].map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5 shrink-0 text-primary" /> {f}
          </li>
        ))}
      </ul>
      {canBuy ? (
        <Button
          onClick={unlock}
          size="lg"
          className="w-full font-semibold bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90"
        >
          Unlock for {price}
        </Button>
      ) : (
        <Button size="lg" className="w-full" disabled>Opening soon</Button>
      )}
      <p className="mt-3 text-xs text-muted-foreground flex items-center justify-center gap-1.5">
        <Lock className="w-3 h-3" /> Secure checkout via Square
      </p>
      {!access.signedIn && (
        <p className="mt-4 text-sm text-muted-foreground">
          Already purchased?{" "}
          <Link to={`/login?next=${encodeURIComponent(returnPath)}`} className="text-primary hover:underline">Log in</Link>
        </p>
      )}
    </div>
  );
}
