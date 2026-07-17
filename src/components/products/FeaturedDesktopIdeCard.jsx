import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Monitor, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HERO_IMAGE } from "@/components/products/desktop-ide/desktopIdeData";
import { trackEvent } from "@/lib/analytics";

const HIGHLIGHTS = [
  "Project Command Center for every Base44 app",
  "Prompt Vault + Prompt Lab",
  "Evidence-backed security & production audits",
  "Agent user testing with real personas",
];

// Featured product banner on /products — Base44 Desktop IDE (early access).
export default function FeaturedDesktopIdeCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-primary/40 bg-card/60 overflow-hidden mb-10 glow-orange"
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        <img src={HERO_IMAGE} alt="Base44 Desktop IDE" className="w-full h-full object-cover" />
        <div className="p-8 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Badge className="text-xs bg-primary/15 text-primary border-primary/30 hover:bg-primary/15">
              <Monitor className="w-3 h-3 mr-1" /> Featured · Early Access
            </Badge>
          </div>
          <h2 className="font-sora font-bold text-2xl md:text-3xl mb-2">Base44 Desktop IDE</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Build, test, audit, and ship Base44 apps from one powerful desktop workspace.
          </p>
          <ul className="space-y-2.5 mb-6 flex-1">
            {HIGHLIGHTS.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <Button
            asChild
            size="lg"
            onClick={() => trackEvent("cta_desktop_ide_featured", { location: "products_page" })}
            className="font-semibold bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90"
          >
            <Link to="/products/base44-desktop-ide">
              Get Early Access <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}