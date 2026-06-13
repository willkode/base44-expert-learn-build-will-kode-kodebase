import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS, PLAN_ORDER } from "@/lib/plans";
import { trackEvent } from "@/lib/analytics";

const HIGHLIGHTED = "pro";

export default function NewUserPlanModal({ open, onClose }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("pro");

  const handleChoose = () => {
    trackEvent("new_user_plan_selected", { plan: selected });
    onClose();
    navigate(`/checkout?plan=${selected}`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-card border-border p-0 overflow-hidden">
        <div className="p-6 border-b border-border">
          <DialogHeader>
            <DialogTitle className="font-sora font-bold text-2xl">
              Welcome! Choose your plan <span className="text-gradient-orange">to get started.</span>
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Pick the plan that fits your workflow — you can upgrade anytime.
            </p>
          </DialogHeader>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLAN_ORDER.map((planId) => {
            const plan = PLANS[planId];
            const isSelected = selected === planId;
            const isHighlighted = planId === HIGHLIGHTED;
            return (
              <button
                key={planId}
                onClick={() => setSelected(planId)}
                className={`rounded-xl border p-5 text-left transition-all duration-200 flex flex-col gap-3 focus:outline-none ${
                  isSelected
                    ? "border-primary bg-primary/10 ring-1 ring-primary"
                    : "border-border bg-background/50 hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-sora font-bold text-lg">{plan.name}</span>
                  {isHighlighted && (
                    <Badge className="text-xs bg-primary/15 text-primary border-primary/30 hover:bg-primary/15">
                      <Sparkles className="w-3 h-3 mr-1" /> Popular
                    </Badge>
                  )}
                </div>
                <div className="flex items-end gap-1">
                  <span className="font-sora font-extrabold text-2xl">{plan.price}</span>
                  <span className="text-muted-foreground text-sm mb-0.5">{plan.period}</span>
                </div>
                <p className="text-xs text-muted-foreground">{plan.desc}</p>
                <ul className="space-y-1.5 mt-1">
                  {plan.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs">
                      <Check className="w-3 h-3 text-primary shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <div className="px-6 pb-6 flex items-center justify-between gap-4">
          <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">
            Skip for now
          </button>
          <Button
            onClick={handleChoose}
            className="font-semibold px-8 bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90"
          >
            Continue with {PLANS[selected].name}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}