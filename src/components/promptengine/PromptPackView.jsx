import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Lock, Loader2, Sparkles, ShieldCheck, ClipboardCheck, Hammer } from "lucide-react";
import PromptCard from "./PromptCard";
import { trackEvent, trackBeginCheckout } from "@/lib/analytics";

const GROUPS = [
  { key: "build", label: "Build", icon: Hammer },
  { key: "qa", label: "QA", icon: ClipboardCheck },
  { key: "security", label: "Security", icon: ShieldCheck },
];

export default function PromptPackView({ status, session, onRefresh }) {
  const [unlocking, setUnlocking] = useState(false);
  const prompts = status?.prompts || [];
  const unlocked = status?.unlocked || status?.isAdmin;

  const grouped = GROUPS.reduce((acc, g) => {
    acc[g.key] = prompts.filter((p) => p.prompt_group === g.key);
    return acc;
  }, {});

  const unlock = async () => {
    setUnlocking(true);
    trackEvent("prompt_engine_unlock_click", { session_id: session.id });
    trackBeginCheckout({ id: session.id, name: "Prompt Pack", category: "Prompt Engine", price: 10 });
    try {
      const redirectUrl = `${window.location.origin}/tools/prompt-engine?session=${session.id}&unlocked=1`;
      const res = await base44.functions.invoke("createSquareCheckoutLink", {
        promptSessionId: session.id,
        redirectUrl,
      });
      if (res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        setUnlocking(false);
      }
    } catch {
      setUnlocking(false);
    }
  };

  return (
    <div className="space-y-5">
      {!unlocked && (
        <div className="rounded-xl border border-primary/40 bg-gradient-to-br from-primary/10 to-transparent p-5 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-sora font-bold text-lg">Unlock your full prompt pack</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {prompts.length} ordered build, QA &amp; security prompts — ready to paste into Base44. One-time $10.
                </p>
              </div>
            </div>
            <Button onClick={unlock} disabled={unlocking} size="lg" className="shrink-0 w-full sm:w-auto">
              {unlocking ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Redirecting…</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> Unlock for $10</>
              )}
            </Button>
          </div>
        </div>
      )}

      <Tabs defaultValue="build">
        <TabsList>
          {GROUPS.map((g) => (
            <TabsTrigger key={g.key} value={g.key} className="gap-1.5">
              <g.icon className="w-4 h-4" />
              {g.label}
              <span className="text-xs opacity-60">({grouped[g.key].length})</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {GROUPS.map((g) => (
          <TabsContent key={g.key} value={g.key} className="space-y-3 mt-4">
            {grouped[g.key].length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-6 text-center">No {g.label} prompts in this pack.</p>
            ) : (
              grouped[g.key].map((p, i) => <PromptCard key={p.id} prompt={p} index={i + 1} />)
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}