import React from "react";
import { useNavigate } from "react-router-dom";
import { Vault, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PromptVaultBanner({ hasAccess }) {
  const navigate = useNavigate();

  return (
    <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-card/60 to-card/60 overflow-hidden">
      {/* Glow accent */}
      <div className="absolute -top-8 -left-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative flex items-center justify-between gap-4 p-5 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary shrink-0">
            <Vault className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-sora font-bold text-base">Prompt Vault</span>
              {!hasAccess && (
                <Badge className="text-[10px] bg-primary/15 text-primary border-primary/30">50% OFF · $5</Badge>
              )}
              {hasAccess && (
                <Badge className="text-[10px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Unlocked</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {hasAccess
                ? "Access your 20+ premium Base44 prompts"
                : "20+ expert prompts — one-time $5 · normally $10"}
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate(hasAccess ? "/vault/access" : "/vault")}
          size="sm"
          className="gap-2 shrink-0 bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] font-semibold hover:opacity-90"
        >
          {hasAccess ? (
            <><Vault className="w-3.5 h-3.5" /> Open Vault <ArrowRight className="w-3.5 h-3.5" /></>
          ) : (
            <><Lock className="w-3.5 h-3.5" /> Get Access <ArrowRight className="w-3.5 h-3.5" /></>
          )}
        </Button>
      </div>
    </div>
  );
}