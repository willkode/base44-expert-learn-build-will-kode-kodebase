import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Heart, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Seo from "@/components/seo/Seo";
import { canonical, SITE } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";
import TipAmountPicker from "@/components/tip/TipAmountPicker";

const PATH = "/tip";
const OG_IMAGE = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/404f7390b_generated_image.png";

const FUNDS = [
  "Free Base44 cheat sheets and guides",
  "The Prompt Library and Agent Skills",
  "Free tools like the Frontend Porter",
  "New tutorials, blog posts and videos",
];

export default function Tip() {
  const [selected, setSelected] = useState(1000);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const thanks = new URLSearchParams(window.location.search).get("thanks");
  const customCents = custom ? Math.round(parseFloat(custom) * 100) : null;
  const amountCents = customCents || selected;

  useEffect(() => {
    trackEvent(thanks ? "tip_complete" : "tip_page_view", { page_path: PATH });
  }, [thanks]);

  const tip = async () => {
    setError("");
    if (!amountCents || amountCents < 100) return setError("Please choose at least $1.");
    if (amountCents > 50000) return setError("Maximum tip is $500.");

    setLoading(true);
    trackEvent("tip_start", { value: amountCents / 100, currency: "USD" });
    try {
      const res = await base44.functions.invoke("createSquareCheckoutLink", {
        donationCents: amountCents,
        guestName: name.trim() || undefined,
        redirectUrl: `${window.location.origin}/tip?thanks=1`,
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

  return (
    <>
      <Seo
        title="Tip Will — Support the Free Base44 Guides, Prompts & Tools"
        description="Everything on KodeBase — cheat sheets, prompt library, agent skills and free tools — is free. If it saved you hours, leave a tip. Any amount, no account needed."
        path={PATH}
        image={OG_IMAGE}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Tip Will — Support KodeBase",
            url: canonical(PATH),
            description:
              "Leave a tip to support the free Base44 guides, prompt library, agent skills and tools published on KodeBase.",
            publisher: { "@type": "Organization", name: SITE.name, url: SITE.domain, logo: SITE.logo },
          },
        ]}
      />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-30" />
        <div className="relative max-w-2xl mx-auto px-6 pt-32 pb-24">
          {thanks ? (
            <div className="text-center rounded-2xl border border-border bg-card/70 p-10 glow-orange">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-primary fill-primary" />
              </div>
              <h1 className="font-sora font-extrabold text-3xl mb-3">Thank you — genuinely.</h1>
              <p className="text-muted-foreground leading-relaxed">
                Your tip goes straight back into new guides, prompts and free tools. It means a lot.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <img
                  src={OG_IMAGE}
                  alt="Tip jar supporting free Base44 content"
                  className="w-28 h-28 object-cover rounded-2xl border border-border mx-auto mb-7"
                />
                <h1 className="font-sora font-extrabold text-4xl md:text-5xl tracking-tight mb-4">
                  Tip <span className="text-gradient-orange">Will</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
                  The cheat sheets, prompts, agent skills and tools are all free and always will be. If they saved you
                  hours, you can say thanks with a tip.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card/70 p-6 md:p-8 mb-8">
                <div className="flex items-center gap-2 mb-5">
                  <Heart className="w-5 h-5 text-primary" />
                  <span className="font-sora font-semibold">Choose your tip</span>
                </div>

                <TipAmountPicker
                  selected={selected}
                  custom={custom}
                  onSelect={(cents) => { setSelected(cents); setCustom(""); }}
                  onCustom={setCustom}
                />

                <div className="mt-5">
                  <label className="text-sm text-muted-foreground mb-1.5 block">Your name (optional)</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="So I know who to thank"
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="mt-5 mb-6">
                  <label className="text-sm text-muted-foreground mb-1.5 block">Leave a note (optional)</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What did you build? What helped most?"
                    rows={3}
                    className="bg-secondary border-border resize-none"
                  />
                </div>

                {error && <p className="text-sm text-destructive mb-4">{error}</p>}

                <Button onClick={tip} disabled={loading} className="w-full h-12 text-base font-semibold">
                  {loading ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Redirecting to checkout...</>
                  ) : (
                    <><Heart className="w-5 h-5 mr-2" /> Tip ${(amountCents / 100).toFixed(0)}</>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Secure one-time payment powered by Square. No account or subscription needed.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card/40 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-sora font-semibold text-sm">What your tip supports</span>
                </div>
                <ul className="space-y-2">
                  {FUNDS.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}