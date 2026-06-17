import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wand2, Users, Boxes, LayoutPanelLeft, Workflow, ShieldCheck, Plug } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

function SectionCard({ icon: Icon, title, count, children }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="font-sora font-semibold text-sm">{title}</h3>
        {count != null && <Badge variant="secondary" className="ml-auto">{count}</Badge>}
      </div>
      {children}
    </div>
  );
}

function nameOf(item) {
  if (typeof item === "string") return item;
  return item?.name || item?.title || JSON.stringify(item);
}

export default function BlueprintReview({ blueprint, session, onGenerated }) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  if (!blueprint) return null;

  const generate = async () => {
    setGenerating(true);
    setError(null);
    trackEvent("prompt_engine_generate_pack", { app_type: blueprint.app_type || "unknown" });
    try {
      const res = await base44.functions.invoke("generatePromptPack", { sessionId: session.id });
      if (res.data?.success) {
        onGenerated?.();
      } else {
        setError(res.data?.error || "Generation failed. Please try again.");
      }
    } catch (e) {
      setError(e?.response?.data?.error || "Generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-sora font-bold text-xl">{blueprint.app_name || session.app_name || "Your App"}</h2>
        {blueprint.app_type && <p className="text-sm text-muted-foreground mt-1">{blueprint.app_type}</p>}
        {blueprint.problem_solved && <p className="text-sm text-foreground/80 mt-3">{blueprint.problem_solved}</p>}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <SectionCard icon={Users} title="Roles" count={(blueprint.roles || []).length}>
          <ul className="space-y-1 text-sm text-foreground/80">
            {(blueprint.roles || []).map((r, i) => <li key={i}>• {nameOf(r)}</li>)}
            {(blueprint.roles || []).length === 0 && <li className="text-muted-foreground italic">None yet</li>}
          </ul>
        </SectionCard>
        <SectionCard icon={Boxes} title="Entities" count={(blueprint.entities || []).length}>
          <ul className="space-y-1 text-sm text-foreground/80">
            {(blueprint.entities || []).map((e, i) => <li key={i}>• {nameOf(e)}</li>)}
            {(blueprint.entities || []).length === 0 && <li className="text-muted-foreground italic">None yet</li>}
          </ul>
        </SectionCard>
        <SectionCard icon={LayoutPanelLeft} title="Pages" count={(blueprint.pages || []).length}>
          <ul className="space-y-1 text-sm text-foreground/80">
            {(blueprint.pages || []).map((p, i) => <li key={i}>• {nameOf(p)}</li>)}
            {(blueprint.pages || []).length === 0 && <li className="text-muted-foreground italic">None yet</li>}
          </ul>
        </SectionCard>
        <SectionCard icon={Wand2} title="Features" count={(blueprint.features || []).length}>
          <ul className="space-y-1 text-sm text-foreground/80">
            {(blueprint.features || []).map((f, i) => <li key={i}>• {nameOf(f)}</li>)}
            {(blueprint.features || []).length === 0 && <li className="text-muted-foreground italic">None yet</li>}
          </ul>
        </SectionCard>
        {(blueprint.workflows || []).length > 0 && (
          <SectionCard icon={Workflow} title="Workflows" count={blueprint.workflows.length}>
            <ul className="space-y-1 text-sm text-foreground/80">
              {blueprint.workflows.map((w, i) => <li key={i}>• {nameOf(w)}</li>)}
            </ul>
          </SectionCard>
        )}
        {(blueprint.integrations || []).length > 0 && (
          <SectionCard icon={Plug} title="Integrations" count={blueprint.integrations.length}>
            <ul className="space-y-1 text-sm text-foreground/80">
              {blueprint.integrations.map((it, i) => <li key={i}>• {nameOf(it)}</li>)}
            </ul>
          </SectionCard>
        )}
      </div>

      {(blueprint.assumptions || []).length > 0 && (
        <SectionCard icon={ShieldCheck} title="Assumptions made">
          <ul className="space-y-1 text-sm text-foreground/80">
            {blueprint.assumptions.map((a, i) => <li key={i}>• {a}</li>)}
          </ul>
        </SectionCard>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-5">
        <div>
          <p className="font-sora font-semibold">Ready to generate your prompt pack?</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            We'll create an ordered set of build, QA, and security prompts from this blueprint.
          </p>
        </div>
        <Button onClick={generate} disabled={generating} size="lg" className="shrink-0 w-full sm:w-auto">
          {generating ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating…</>
          ) : (
            <><Wand2 className="w-4 h-4 mr-2" /> Approve & Generate</>
          )}
        </Button>
      </div>
    </div>
  );
}