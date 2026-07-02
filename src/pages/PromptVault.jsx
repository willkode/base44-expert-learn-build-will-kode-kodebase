import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Vault, Check, Lock, Sparkles, Bot, Shield, TrendingUp, Code2, Megaphone, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import Seo from "@/components/seo/Seo";
import { trackEvent } from "@/lib/analytics";

const CATEGORY_ICONS = {
  "Development": Code2,
  "Security": Shield,
  "SEO": TrendingUp,
  "Marketing": Megaphone,
  "AI & Prompting": Bot,
  "Business": Zap,
  "Productivity": Sparkles,
  "Content": Megaphone,
  "Sales": Zap,
  "Design": Sparkles,
  "Other": Sparkles,
};

const PRODUCT_ID = "6a36c8c785752800bd7580be";

const FEATURES = [
  "20+ premium expert-crafted prompts",
  "Covers Dev, Security, SEO, Marketing, AI & more",
  "Every prompt includes the recommended AI model",
  "Instant lifetime access after one payment",
  "New prompts added regularly — always fresh",
  "Copy-paste ready for any Base44 project",
];

const FAQS = [
  { q: "What's included?", a: "20+ curated, expert-written prompts covering every major area of Base44 development: architecture, admin dashboards, security audits, SEO, marketing, migration, and more." },
  { q: "How do I access the prompts?", a: "Sign up (or log in), pay once, and you get instant access in your dashboard. Your prompts are always available — no expiry." },
  { q: "Do I need to be a developer?", a: "Nope. The prompts are written to work with any Base44 user. Just copy, paste, and let the AI do the work." },
  { q: "Will new prompts be added?", a: "Yes. Vault members get access to new prompts as they're added — no extra charge." },
  { q: "What's the refund policy?", a: "If you're not happy after trying the prompts, just reach out and we'll make it right." },
];

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen(!open)} className="w-full text-left rounded-xl border border-border bg-card/40 p-5 hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between gap-4">
        <span className="font-semibold text-sm">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </div>
      {open && <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a}</p>}
    </button>
  );
}

export default function PromptVault() {
  const navigate = useNavigate();
  const [previews, setPreviews] = useState([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    trackEvent("prompt_vault_page_view", { source: "landing" });
    // Load a few published prompts for preview (titles + categories only)
    base44.functions.invoke("getVaultPreviews", {})
      .then((res) => setPreviews(res.data?.previews || []))
      .catch(() => {});

    // Check if current user has paid
    base44.auth.isAuthenticated().then(async (authed) => {
      if (!authed) { setCheckingAccess(false); return; }
      const res = await base44.functions.invoke("checkVaultAccess", {});
      setHasAccess(!!res.data?.hasAccess);
      setCheckingAccess(false);
    }).catch(() => setCheckingAccess(false));
  }, []);

  const handleCTA = async () => {
    trackEvent("prompt_vault_cta_click", { location: "hero" });
    const authed = await base44.auth.isAuthenticated();
    if (!authed) { navigate("/register?next=/vault"); return; }
    if (hasAccess) { navigate("/vault/access"); return; }
    navigate(`/checkout?product=${PRODUCT_ID}`);
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-24 px-6">
      <Seo
        title="Prompt Vault — 20+ Expert Base44 Prompts | KodeBase"
        description="Copy-paste expert prompts for Base44 developers. Build faster, audit smarter, scale confidently. One-time $5 — 50% off launch price."
        path="/vault"
        type="product"
        image="https://media.base44.com/images/public/6a1905a0bc76553d6c934574/b1ec637c7_generated_image.png"
      />

      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold mb-6">
            <Vault className="w-3.5 h-3.5" /> Limited Launch Price — 50% Off
          </div>
          <h1 className="font-sora font-bold text-4xl md:text-6xl tracking-tight mb-5">
            The <span className="text-gradient-orange">Prompt Vault</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            20+ expert-crafted prompts for Base44 builders. Build faster, audit smarter, scale confidently — all with copy-paste precision.
          </p>

          {/* Price */}
          <div className="inline-flex items-end gap-3 mb-8">
            <span className="font-sora font-extrabold text-5xl text-gradient-orange">$5</span>
            <div className="mb-1.5 text-left">
              <div className="text-muted-foreground line-through text-sm">$10</div>
              <div className="text-xs text-muted-foreground">one-time · lifetime access</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={handleCTA}
              size="lg"
              className="font-bold text-base px-8 py-6 bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90 glow-orange"
            >
              {hasAccess ? "Access My Vault" : "Get Lifetime Access — $5"}
            </Button>
            {!hasAccess && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Secure checkout via Square
              </p>
            )}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-16">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card/40">
              <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm">{f}</span>
            </div>
          ))}
        </motion.div>

        {/* Prompt preview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="mb-16">
          <h2 className="font-sora font-bold text-2xl text-center mb-2">What's inside the vault</h2>
          <p className="text-muted-foreground text-center text-sm mb-8">A glimpse of what you get — full prompts unlocked after purchase.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {previews.map((p) => {
              const Icon = CATEGORY_ICONS[p.category] || Sparkles;
              return (
                <div key={p.id} className="relative rounded-xl border border-border bg-card/50 p-5 overflow-hidden group">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="w-4 h-4" />
                    </span>
                    <Badge variant="secondary" className="text-[10px]">{p.category}</Badge>
                  </div>
                  <p className="font-semibold text-sm mb-1 line-clamp-2">{p.title}</p>
                  {p.description && <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>}
                  {/* Lock overlay */}
                  {!hasAccess && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                      <Lock className="w-5 h-5 text-primary" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {!hasAccess && (
            <div className="text-center mt-6">
              <p className="text-xs text-muted-foreground mb-3">+ {Math.max(0, 20 - previews.length)} more prompts inside the vault</p>
              <Button onClick={handleCTA} className="bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] font-semibold hover:opacity-90">
                Unlock All Prompts — $5
              </Button>
            </div>
          )}
        </motion.div>

        {/* FAQ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="mb-16">
          <h2 className="font-sora font-bold text-2xl text-center mb-8">FAQ</h2>
          <div className="max-w-2xl mx-auto space-y-3">
            {FAQS.map((f) => <FAQ key={f.q} {...f} />)}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        {!hasAccess && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="text-center rounded-2xl border border-primary/20 bg-primary/5 p-10">
            <Vault className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="font-sora font-bold text-2xl mb-2">Ready to unlock the vault?</h2>
            <p className="text-muted-foreground text-sm mb-6">One-time payment. Lifetime access. New prompts added for free.</p>
            <Button onClick={handleCTA} size="lg" className="font-bold px-8 bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90 glow-orange">
              Get Lifetime Access — $5
            </Button>
            <p className="text-xs text-muted-foreground mt-3">Normally $10 · 50% off launch price</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}