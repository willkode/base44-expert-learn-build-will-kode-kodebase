import React, { useState } from "react";
import { Sparkles, ClipboardCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import {
  SUGGESTED_REGISTRY,
  dedupeKey,
  reviewCompleteness,
} from "@/components/admin/security/registryConfig";

export default function RegistrySetupToolbar({ items, onChanged }) {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [warnings, setWarnings] = useState(null);

  const autoGenerate = async () => {
    setGenerating(true);
    const existingKeys = new Set(items.map(dedupeKey));
    const toCreate = SUGGESTED_REGISTRY
      .filter((s) => !existingKeys.has(dedupeKey(s)))
      .map((s) => ({ registry_id: `reg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, ...s }));

    if (toCreate.length > 0) {
      await base44.entities.SecurityRegistry.bulkCreate(toCreate);
    }
    setGenerating(false);
    toast({
      title: toCreate.length > 0 ? "Suggested registry added" : "Registry already complete",
      description: toCreate.length > 0
        ? `Added ${toCreate.length} starter item${toCreate.length === 1 ? "" : "s"} (no duplicates created).`
        : "All suggested items already exist.",
    });
    onChanged?.();
  };

  const reviewRegistry = () => {
    const result = reviewCompleteness(items);
    setWarnings(result);
    toast({
      title: result.length === 0 ? "Registry looks complete" : `${result.length} gap${result.length === 1 ? "" : "s"} found`,
      description: result.length === 0
        ? "All required registry categories are covered."
        : "Review the warnings below to finish setup.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card/70 p-4">
        <Button onClick={autoGenerate} disabled={generating} className="gap-2">
          <Sparkles className="w-4 h-4" />
          {generating ? "Generating…" : "Auto-Generate Suggested Registry"}
        </Button>
        <Button onClick={reviewRegistry} variant="outline" className="gap-2">
          <ClipboardCheck className="w-4 h-4" />
          Review Registry Completeness
        </Button>
      </div>

      {warnings && warnings.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-2">
            <AlertTriangle className="w-4 h-4" />
            Registry completeness warnings
          </div>
          <ul className="space-y-1.5">
            {warnings.map((w, i) => (
              <li key={i} className="text-sm text-amber-200/90 flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {warnings && warnings.length === 0 && (
        <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4 flex items-center gap-2 text-green-400 font-semibold text-sm">
          <CheckCircle2 className="w-4 h-4" />
          Registry covers all required categories.
        </div>
      )}
    </div>
  );
}