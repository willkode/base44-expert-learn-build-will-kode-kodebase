import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SETUP_STEPS } from "./brandConfig";
import { SECTION_COMPONENTS } from "./BrandFormSections";

// Guided, step-by-step first-time setup. Validation runs per-step on advance and on save.
export default function BrandSetupWizard({ draft, set, errors, validateStep, onSave, saving }) {
  const [step, setStep] = useState(0);
  const current = SETUP_STEPS[step];
  const Section = SECTION_COMPONENTS[current.key];
  const isLast = step === SETUP_STEPS.length - 1;

  const next = () => {
    if (validateStep(current.key)) setStep((s) => Math.min(s + 1, SETUP_STEPS.length - 1));
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {SETUP_STEPS.map((s, i) => (
          <React.Fragment key={s.key}>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border text-xs font-semibold shrink-0 ${
                i < step
                  ? "bg-primary border-primary text-primary-foreground"
                  : i === step
                  ? "border-primary text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            {i < SETUP_STEPS.length - 1 && (
              <div className={`h-px flex-1 ${i < step ? "bg-primary" : "bg-border"}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <h2 className="font-sora font-bold text-xl mb-1">{current.title}</h2>
        <p className="text-sm text-muted-foreground mb-6">{current.description}</p>

        <Section draft={draft} set={set} errors={errors} />

        <div className="flex items-center justify-between mt-8 pt-5 border-t border-border">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(s - 1, 0))} disabled={step === 0}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <span className="text-xs text-muted-foreground">Step {step + 1} of {SETUP_STEPS.length}</span>
          {isLast ? (
            <Button onClick={onSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Check className="w-4 h-4 mr-1.5" />}
              Finish & Save
            </Button>
          ) : (
            <Button onClick={next}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}