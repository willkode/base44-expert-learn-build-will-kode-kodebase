import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Vault, Copy, Check, Bot, Shield, TrendingUp, Code2, Megaphone, Zap, Sparkles, Lock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import LoadingState from "@/components/shared/LoadingState";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

const PRODUCT_ID = "6a36c8c785752800bd7580be";

const CATEGORY_ICONS = {
  "Development": Code2,
  "Security": Shield,
  "SEO": TrendingUp,
  "Marketing": Megaphone,
  "AI & Prompting": Bot,
  "Business": Zap,
  "Productivity": Sparkles,
  "Content": Megaphone,
  "Sales": Zap,
  "Design": Sparkles,
  "Other": Sparkles,
};

function PromptCard({ prompt }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const Icon = CATEGORY_ICONS[prompt.category] || Sparkles;

  const copy = () => {
    navigator.clipboard.writeText(prompt.prompt_body);
    setCopied(true);
    trackEvent("vault_prompt_copied", { promptId: prompt.id, title: prompt.title });
    toast.success("Prompt copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-card/50 hover:border-primary/30 transition-colors">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <Icon className="w-4 h-4" />
            </span>
            <Badge variant="secondary" className="text-[10px]">{prompt.category}</Badge>
            {prompt.recommended_model && (
              <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                <Bot className="w-2.5 h-2.5 mr-1" />{prompt.recommended_model}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={copy}>
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>

        <h3 className="font-semibold text-sm mb-1">{prompt.title}</h3>
        {prompt.description && <p className="text-xs text-muted-foreground mb-3">{prompt.description}</p>}

        {(prompt.tags || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {prompt.tags.map((t) => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{t}</span>
            ))}
          </div>
        )}

        <button onClick={() => setExpanded(!expanded)} className="text-xs text-primary hover:underline">
          {expanded ? "Hide prompt" : "View full prompt"}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-border px-5 pb-5 pt-4">
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed bg-background/60 rounded-lg p-4 max-h-64 overflow-y-auto">
            {prompt.prompt_body}
          </pre>
          <Button onClick={copy} size="sm" className="mt-3 gap-2 w-full" variant="outline">
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            Copy prompt
          </Button>
        </div>
      )}
    </div>
  );
}

export default function VaultAccess() {
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  useEffect(() => {
    trackEvent("vault_access_view");
    const init = async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) { navigate("/login?next=/vault/access"); return; }
      await base44.auth.me();
      const res = await base44.functions.invoke("checkVaultAccess", {});
      if (!res.data?.hasAccess) { setHasAccess(false); setLoading(false); return; }
      setHasAccess(true);
      // Prompts are served by the access-gated backend (service role) so admin-granted
      // and Pro users can read them despite VaultPrompt's admin/creator-only RLS.
      setPrompts(res.data.prompts || []);
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <LoadingState label="Loading your vault…" />
    </div>
  );

  if (!hasAccess) return (
    <div className="min-h-screen bg-background blueprint-grid flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-10 text-center">
        <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="font-sora font-bold text-2xl mb-2">Vault locked</h1>
        <p className="text-muted-foreground text-sm mb-6">Included free with Pro membership — or get lifetime access for just $5 (50% off the regular $10).</p>
        <Button onClick={() => navigate(`/checkout?product=${PRODUCT_ID}`)} className="w-full font-semibold bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90">
          Unlock for $5
        </Button>
        <button onClick={() => navigate("/pro")} className="mt-3 text-sm text-primary hover:underline">
          Or get it free with Pro →
        </button>
      </div>
    </div>
  );

  const categories = ["all", ...Array.from(new Set(prompts.map((p) => p.category).filter(Boolean)))];
  const filtered = prompts.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q) || (p.tags || []).some((t) => t.toLowerCase().includes(q));
    const matchCat = filterCat === "all" || p.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-background pt-24 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Vault className="w-5 h-5 text-primary" />
              <h1 className="font-sora font-bold text-2xl">Your Prompt Vault</h1>
            </div>
            <p className="text-sm text-muted-foreground">{prompts.length} premium prompts · lifetime access</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search prompts…" className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilterCat(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  filterCat === c
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {c === "all" ? "All" : c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Vault className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No prompts found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((p) => <PromptCard key={p.id} prompt={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}