import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Coffee, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Seo from "@/components/seo/Seo";
import { SITE } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";

const OG_IMAGE = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/2b597e229_generated_image.png";

const PRESETS = [
  { cups: 1, cents: 500, label: "$5" },
  { cups: 3, cents: 1500, label: "$15" },
  { cups: 5, cents: 2500, label: "$25" },
];

export default function BuyMeACoffee() {
  const [selected, setSelected] = useState(500);
  const [custom, setCustom] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const customCents = custom ? Math.round(parseFloat(custom) * 100) : null;
  const amountCents = customCents || selected;

  const donate = async () => {
    setError("");
    if (!amountCents || amountCents < 100) {
      setError("Please choose at least $1.");
      return;
    }
    if (amountCents > 50000) {
      setError("Maximum donation is $500.");
      return;
    }
    setLoading(true);
    trackEvent("donate_start", { value: amountCents / 100, currency: "USD" });
    try {
      const res = await base44.functions.invoke("createSquareCheckoutLink", {
        donationCents: amountCents,
        redirectUrl: `${window.location.origin}/coffee?thanks=1`,
      });
      if (res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        setError(res.data?.error || "Could not start checkout. Please try again.");
        setLoading(false);
      }
    } catch (e) {
      setError("Could not start checkout. Please try again.");
      setLoading(false);
    }
  };

  const thanks = new URLSearchParams(window.location.search).get("thanks");

  return (
    <>
      <Seo
        title="Buy Me a Coffee — Support KodeBase"
        description="Enjoying KodeBase? Fuel the work behind the blueprints, prompts, and tutorials with a quick coffee. Secure one-time support via Square."
        path="/coffee"
        image={OG_IMAGE}
      />

      <section className="relative overflow-hidden min-h-[80vh]">
        <div className="absolute inset-0 blueprint-grid opacity-30" />
        <div className="relative max-w-2xl mx-auto px-6 py-24">
          {thanks ? (
            <div className="text-center rounded-2xl border border-border bg-card/70 p-10 glow-orange">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-primary fill-primary" />
              </div>
              <h1 className="font-sora font-extrabold text-3xl mb-3">Thank you! 🎉</h1>
              <p className="text-muted-foreground leading-relaxed">
                Your support means the world and helps keep new blueprints, prompts, and tutorials coming.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <img
                  src={OG_IMAGE}
                  alt="Buy me a coffee"
                  className="w-28 h-28 object-cover rounded-2xl border border-border mx-auto mb-7"
                />
                <h1 className="font-sora font-extrabold text-4xl md:text-5xl tracking-tight mb-4">
                  Buy me a <span className="text-gradient-orange">coffee</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
                  Enjoying the blueprints, prompts, and tutorials? Fuel the work behind KodeBase with a quick coffee.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card/70 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-5">
                  <Coffee className="w-5 h-5 text-primary" />
                  <span className="font-sora font-semibold">Choose an amount</span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  {PRESETS.map((p) => {
                    const active = !custom && selected === p.cents;
                    return (
                      <button
                        key={p.cents}
                        onClick={() => { setSelected(p.cents); setCustom(""); }}
                        className={`rounded-xl border py-4 flex flex-col items-center gap-1 transition-colors ${
                          active
                            ? "border-primary bg-primary/10"
                            : "border-border bg-secondary hover:border-primary/40"
                        }`}
                      >
                        <span className="text-lg">{"☕".repeat(p.cups)}</span>
                        <span className="font-semibold text-sm">{p.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mb-5">
                  <label className="text-sm text-muted-foreground mb-1.5 block">Or enter a custom amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      min="1"
                      max="500"
                      step="1"
                      value={custom}
                      onChange={(e) => setCustom(e.target.value)}
                      placeholder="10"
                      className="pl-7 bg-secondary border-border"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-sm text-muted-foreground mb-1.5 block">Leave a note (optional)</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Say something nice..."
                    rows={3}
                    className="bg-secondary border-border resize-none"
                  />
                </div>

                {error && <p className="text-sm text-destructive mb-4">{error}</p>}

                <Button
                  onClick={donate}
                  disabled={loading}
                  className="w-full h-12 text-base font-semibold"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Redirecting to checkout...</>
                  ) : (
                    <><Heart className="w-5 h-5 mr-2" /> Support with ${(amountCents / 100).toFixed(0)}</>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Secure one-time payment powered by Square. No account or subscription.
                </p>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}