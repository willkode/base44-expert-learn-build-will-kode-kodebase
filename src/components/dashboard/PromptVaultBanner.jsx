import React from "react";
import { useNavigate } from "react-router-dom";
import { Vault, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PromptVaultBanner({ hasAccess }) {
  const navigate = useNavigate();

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card/70 to-card/60 transition-colors hover:border-primary/50">
      {/* Glow accent */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="relative flex flex-col gap-5 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary shrink-0 ring-1 ring-primary/25 transition-transform group-hover:scale-105">
            <Vault className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-sora font-bold text-base">Prompt Vault</span>
              {!hasAccess && (
                <Badge className="text-[10px] bg-primary/15 text-primary border-primary/30">50% OFF · $5</Badge>
              )}
              {hasAccess && (
                <Badge className="text-[10px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Unlocked</Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {hasAccess
                ? "Access your 20+ premium Base44 prompts"
                : "20+ expert prompts — one-time $5 · normally $10"}
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate(hasAccess ? "/vault/access" : "/vault")}
          className="w-full gap-2 rounded-full bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] font-semibold transition-all hover:opacity-90 hover:-translate-y-0.5"
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