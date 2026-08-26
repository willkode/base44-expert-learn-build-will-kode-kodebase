import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Boxes, Check, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import Seo from "@/components/seo/Seo";
import { trackEvent, trackCTA } from "@/lib/analytics";
import ThreeUiElementCard from "@/components/products/threeui/ThreeUiElementCard";
import LoadingState from "@/components/shared/LoadingState";

const PRODUCT_ID = "6a8e9f6939a15429ae635383";
const OG_IMAGE = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/c40f424bf_generated_image.png";

const FEATURES = [
  "Every 3D UI element in the catalog, prompt included",
  "Copy-paste into Base44, Cursor, Claude or any AI builder",
  "Each prompt specifies layout, motion, props and a11y",
  "Built on three.js, framer-motion and Tailwind tokens",
  "No design files, no license fees, no lock-in",
  "New elements added free — lifetime access",
];

export default function ThreeUiKit() {
  const navigate = useNavigate();
  const [elements, setElements] = useState([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackEvent("three_ui_kit_page_view", { source: "landing" });
    base44.functions
      .invoke("threeUiCatalog", {})
      .then((res) => {
        setElements(res.data?.elements || []);
        setHasAccess(!!res.data?.hasAccess);
        setTotal(res.data?.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCTA = async () => {
    trackCTA({ text: "Get the 3D UI Element Kit", location: "three_ui_kit", destination: "/checkout" });
    const authed = await base44.auth.isAuthenticated();
    if (!authed) {
      navigate("/register?next=/products/3d-ui-element-kit");
      return;
    }
    navigate(`/checkout?product=${PRODUCT_ID}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24 px-6 pt-16">
      <Seo
        title="3D UI Element Kit — Prompts That Build Premium 3D Interfaces | KodeBase"
        description="Get the full catalog of 3D UI element prompts — glass cards, orbit heroes, extruded buttons, depth navbars. Copy, paste, ship. One-time $25, lifetime access."
        path="/products/3d-ui-element-kit"
        type="product"
        image={OG_IMAGE}
      />

      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold mb-6">
            <Boxes className="w-3.5 h-3.5" /> New — 3D UI Element Kit
          </div>
          <h1 className="font-sora font-bold text-4xl md:text-6xl tracking-tight mb-5">
            Ship interfaces that look <span className="text-gradient-orange">three-dimensional</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            A full catalog of premium 3D interface elements — each one with the exact prompt to recreate it inside
            your own app. No design files, no component library to fight. Copy the prompt, paste it into your builder,
            ship the element.
          </p>

          <div className="inline-flex items-end gap-3 mb-8">
            <span className="font-sora font-extrabold text-5xl text-gradient-orange">$25</span>
            <div className="mb-1.5 text-left text-xs text-muted-foreground">one-time · lifetime access</div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {hasAccess ? (
              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-primary/30 bg-primary/10 text-primary text-sm font-semibold">
                <Check className="w-4 h-4" /> You own the full catalog — prompts unlocked below
              </div>
            ) : (
              <>
                <Button
                  onClick={handleCTA}
                  size="lg"
                  className="font-bold text-base px-8 py-6 bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90 glow-orange"
                >
                  Get the Full Catalog — $25
                </Button>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Secure checkout via Square
                </p>
              </>
            )}
          </div>
        </motion.div>

        {/* Preview image */}
        <motion.img
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          src={OG_IMAGE}
          alt="3D UI elements — glass card, button orb, toggle and geometric hero object"
          className="w-full rounded-2xl border border-border mb-16"
        />

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-16">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card/40">
              <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm">{f}</span>
            </div>
          ))}
        </div>

        {/* Catalog */}
        <div className="mb-16">
          <h2 className="font-sora font-bold text-2xl text-center mb-2">
            {hasAccess ? "Your catalog" : "What's in the catalog"}
          </h2>
          <p className="text-muted-foreground text-center text-sm mb-8">
            {hasAccess
              ? `${total} elements — copy any prompt straight into your builder.`
              : `${total} elements. Specs are public — the full build prompts unlock after purchase.`}
          </p>

          {loading ? (
            <LoadingState label="Loading the catalog…" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {elements.map((el) => (
                <ThreeUiElementCard key={el.id} element={el} locked={!hasAccess} onUnlock={handleCTA} />
              ))}
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        {!hasAccess && (
          <div className="text-center rounded-2xl border border-primary/20 bg-primary/5 p-10">
            <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="font-sora font-bold text-2xl mb-2">One payment. The whole catalog.</h2>
            <p className="text-muted-foreground text-sm mb-6">
              $25 once, lifetime access — including every element added later.
            </p>
            <Button
              onClick={handleCTA}
              size="lg"
              className="font-bold px-8 bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90 glow-orange"
            >
              Unlock All Prompts — $25
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}