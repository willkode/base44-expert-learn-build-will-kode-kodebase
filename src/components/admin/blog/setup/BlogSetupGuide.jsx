import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Rocket, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trackEvent } from "@/lib/analytics";
import FirstRunChecklist from "./FirstRunChecklist";
import SecretsChecklist from "./SecretsChecklist";
import HowToSteps from "./HowToSteps";
import SafetyWarnings from "./SafetyWarnings";

const DISMISS_KEY = "blog_setup_guide_collapsed";

export default function BlogSetupGuide() {
  const [status, setStatus] = useState(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    base44.functions.invoke("getBlogSetupStatus", {}).then((res) => {
      const data = res.data || {};
      if (data.success) {
        setStatus(data);
        // Auto-collapse once everything is done, unless the user re-opened it.
        const userCollapsed = localStorage.getItem(DISMISS_KEY) === "1";
        if (data.progress.percent === 100 || userCollapsed) setOpen(false);
      }
    });
  }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    localStorage.setItem(DISMISS_KEY, next ? "0" : "1");
    if (next) trackEvent("admin_open_blog_setup_guide", {});
  };

  if (!status) return null;

  const { progress } = status;
  const done = progress.percent === 100;

  return (
    <div className="rounded-2xl border border-border bg-card/60 overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#f87171]/15 via-[#fb923c]/15 to-[#facc15]/15 flex items-center justify-center shrink-0">
          {done ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <Rocket className="w-5 h-5 text-primary" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-sora font-semibold text-base">
              {done ? "Your blog is production-ready" : "Get your blog production-ready"}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {progress.completed} of {progress.total} setup steps complete
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden max-w-md">
            <div
              className="h-full bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] transition-all"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-border pt-5">
          <Tabs defaultValue="checklist">
            <TabsList className="mb-4 flex-wrap h-auto">
              <TabsTrigger value="checklist">Setup checklist</TabsTrigger>
              <TabsTrigger value="howto">How it works</TabsTrigger>
              <TabsTrigger value="environment">Environment</TabsTrigger>
              <TabsTrigger value="safety">Safety</TabsTrigger>
            </TabsList>
            <TabsContent value="checklist">
              <FirstRunChecklist checklist={status.checklist} />
            </TabsContent>
            <TabsContent value="howto">
              <HowToSteps />
            </TabsContent>
            <TabsContent value="environment">
              <SecretsChecklist secrets={status.secrets} />
            </TabsContent>
            <TabsContent value="safety">
              <SafetyWarnings />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}