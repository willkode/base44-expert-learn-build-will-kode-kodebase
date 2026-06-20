import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import Seo from "@/components/seo/Seo";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, FileText, MessageSquare, Lock, ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import BlueprintProgressRing from "@/components/promptengine/BlueprintProgressRing";
import DiscoveryChat from "@/components/promptengine/DiscoveryChat";
import BlueprintReview from "@/components/promptengine/BlueprintReview";
import PromptPackView from "@/components/promptengine/PromptPackView";
import UnlockedPacksList from "@/components/promptengine/UnlockedPacksList";
import { Link } from "react-router-dom";

const OG_IMAGE = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/6935b73f9_generated_image.png";

// Stages: discovery (chat) → review (approve blueprint) → pack (prompts + paywall)
export default function PromptEngine() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [blueprint, setBlueprint] = useState(null);
  const [packStatus, setPackStatus] = useState(null);
  const [view, setView] = useState("discovery"); // discovery | review | pack
  const [allSessions, setAllSessions] = useState([]);
  const [userPlan, setUserPlan] = useState(null);

  const sessionIdFromUrl = new URLSearchParams(window.location.search).get("session");

  const loadPackStatus = useCallback(async (sid) => {
    const res = await base44.functions.invoke("getPromptPackStatus", { sessionId: sid });
    if (res.data?.success) setPackStatus(res.data);
    return res.data;
  }, []);

  const loadSession = useCallback(async (sid) => {
    const [sessions, msgs, blueprints] = await Promise.all([
      base44.entities.PromptGeneratorSession.filter({ id: sid }),
      base44.entities.PromptGeneratorMessage.filter({ session_id: sid }, "order_index"),
      base44.entities.AppBlueprint.filter({ session_id: sid }, "-created_date", 1),
    ]);
    const s = sessions[0];
    if (!s) return null;
    setSession(s);
    setMessages(msgs);
    setBlueprint(blueprints[0] || null);
    if (s.current_stage === "prompts_ready" || s.generated_prompt_count > 0) {
      await loadPackStatus(sid);
      setView("pack");
    } else if (s.current_stage === "blueprint_ready") {
      setView("review");
    } else {
      setView("discovery");
    }
    return s;
  }, [loadPackStatus]);

  useEffect(() => {
    trackEvent("view_prompt_engine", { page_path: "/tools/prompt-engine" });
    (async () => {
      setLoading(true);
      try {
        const user = await base44.auth.me();
        const profiles = await base44.entities.UserProfile.filter({ userId: user.id });
        const plan = profiles[0]?.plan || "free";
        setUserPlan(plan);

        if (plan !== "pro" && plan !== "agency") return; // gate — don't load sessions for non-pro

        // Load all of the user's sessions so they can return to any unlocked pack.
        const all = await base44.entities.PromptGeneratorSession.list("-created_date", 100);
        setAllSessions(all);
        if (sessionIdFromUrl) {
          await loadSession(sessionIdFromUrl);
        } else if (all[0]) {
          // Resume the most recent session.
          await loadSession(all[0].id);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionIdFromUrl, loadSession]);

  const openSession = async (s) => {
    setLoading(true);
    try {
      await loadSession(s.id);
    } finally {
      setLoading(false);
    }
  };

  const startNew = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const s = await base44.entities.PromptGeneratorSession.create({
        user_id: user.id,
        title: "New app idea",
        current_stage: "discovery",
        blueprint_status: "empty",
      });
      trackEvent("prompt_engine_start_session", {});
      setAllSessions((prev) => [s, ...prev]);
      setSession(s);
      setMessages([]);
      setBlueprint(null);
      setPackStatus(null);
      setView("discovery");
    } finally {
      setLoading(false);
    }
  };

  const handlePackGenerated = async () => {
    if (!session) return;
    await loadPackStatus(session.id);
    const all = await base44.entities.PromptGeneratorSession.list("-created_date", 100);
    setAllSessions(all);
    const refreshed = all.find((s) => s.id === session.id);
    if (refreshed) setSession(refreshed);
    setView("pack");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <LoadingState label="Loading the Prompt Engine…" />
      </div>
    );
  }

  const isPro = userPlan === "pro" || userPlan === "agency";

  if (!isPro) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Seo title="Prompt Engine — Pro Feature | KodeBase" path="/tools/prompt-engine" noindex />
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-sora font-bold text-2xl md:text-3xl mb-3">Prompt Engine is a Pro feature</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Upgrade to the <strong className="text-foreground">Pro</strong> or <strong className="text-foreground">Agency</strong> plan to access the Prompt Engine and generate ordered prompt packs from your app ideas.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/pricing">
            <Button size="lg" className="bg-primary hover:bg-primary/90 font-semibold px-8">
              Upgrade to Pro <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="lg" variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
        <p className="text-xs text-muted-foreground mt-6">
          Already upgraded? <button onClick={() => window.location.reload()} className="underline hover:text-foreground">Refresh the page.</button>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
      <Seo
        title="Prompt Engine — Generate a Full Build Plan from Your App Idea | KodeBase"
        description="Chat through your app idea and instantly generate an ordered pack of production-grade build, QA, and security prompts — ready to paste into Base44."
        path="/tools/prompt-engine"
        type="website"
        image={OG_IMAGE}
        noindex
      />

      <PageHeader
        title="Prompt Engine"
        description="Turn an app idea into an ordered pack of build, QA & security prompts."
        actions={
          <Button onClick={startNew} variant="outline">
            <Sparkles className="w-4 h-4 mr-2" /> New idea
          </Button>
        }
      />

      {!session ? (
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-sora font-bold text-xl">Start with your app idea</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Describe what you want to build. The engine asks a few smart questions, drafts a complete blueprint,
              then generates copy-paste-ready prompts.
            </p>
            <Button onClick={startNew} size="lg" className="mt-6">
              <Sparkles className="w-4 h-4 mr-2" /> Start a new blueprint
            </Button>
          </div>
          <UnlockedPacksList sessions={allSessions} onOpen={openSession} />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Stage bar */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
            <div className="flex items-center gap-3">
              <BlueprintProgressRing score={session.completion_score || 0} size={52} />
              <div>
                <p className="font-sora font-semibold text-sm">{session.app_name || "Your app"}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {view === "pack" ? "Prompt pack" : view === "review" ? "Blueprint review" : "Discovery"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {view !== "discovery" && (
                <Button variant="ghost" size="sm" onClick={() => setView("discovery")}>
                  <MessageSquare className="w-4 h-4 mr-1.5" /> Chat
                </Button>
              )}
              {blueprint && view === "pack" && (
                <Button variant="ghost" size="sm" onClick={() => setView("review")}>
                  <FileText className="w-4 h-4 mr-1.5" /> Blueprint
                </Button>
              )}
              {view === "review" && (
                <Button variant="ghost" size="sm" onClick={() => setView("discovery")}>
                  <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                </Button>
              )}
            </div>
          </div>

          {view === "discovery" && (
            <DiscoveryChat
              session={session}
              messages={messages}
              onMessages={setMessages}
              onSession={setSession}
              onReady={() => setView("review")}
            />
          )}

          {view === "review" && (
            <BlueprintReview blueprint={blueprint} session={session} onGenerated={handlePackGenerated} />
          )}

          {view === "pack" && packStatus && (
            <PromptPackView status={packStatus} session={session} onRefresh={() => loadPackStatus(session.id)} />
          )}

          {allSessions.filter((s) => s.unlocked && s.id !== session.id && s.generated_prompt_count > 0).length > 0 && (
            <UnlockedPacksList sessions={allSessions.filter((s) => s.id !== session.id)} onOpen={openSession} />
          )}
        </div>
      )}
    </div>
  );
}