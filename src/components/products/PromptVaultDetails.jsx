import React, { useState, useEffect } from "react";
import { Bot, Shield, TrendingUp, Code2, Megaphone, Zap, Sparkles, Lock, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";

// Category → image map
const CATEGORY_IMAGES = {
  "Development": "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/5eb075ea8_generated_image.png",
  "Security": "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/c687c3403_generated_image.png",
  "SEO": "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/7f6525542_generated_image.png",
  "AI & Prompting": "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/a18fe57a6_generated_image.png",
  "Marketing": "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/127f569d5_generated_image.png",
  "Design": "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/4fdeff51f_generated_image.png",
  "Business": "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/127f569d5_generated_image.png",
  "Productivity": "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/a18fe57a6_generated_image.png",
  "default": "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/179ac49c0_generated_image.png",
};

const CATEGORY_ICONS = {
  "Development": Code2,
  "Security": Shield,
  "SEO": TrendingUp,
  "Marketing": Megaphone,
  "AI & Prompting": Bot,
  "Business": Zap,
  "Productivity": Sparkles,
  "Design": Sparkles,
  "default": Sparkles,
};

function PromptCard({ prompt, index }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = CATEGORY_ICONS[prompt.category] || CATEGORY_ICONS.default;
  const img = CATEGORY_IMAGES[prompt.category] || CATEGORY_IMAGES.default;

  return (
    <div className="rounded-2xl border border-border bg-card/50 overflow-hidden hover:border-primary/30 transition-all group">
      {/* Category image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={img}
          alt={prompt.category}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm text-primary">
            <Icon className="w-3.5 h-3.5" />
          </span>
          <Badge variant="secondary" className="text-[10px] bg-background/80 backdrop-blur-sm">{prompt.category}</Badge>
        </div>
        <div className="absolute top-3 right-3">
          <span className="text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
            #{index + 1}
          </span>
        </div>
        {prompt.recommended_model && (
          <div className="absolute bottom-3 right-3">
            <span className="text-[10px] bg-background/80 border border-border px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
              <Bot className="w-2.5 h-2.5 text-primary" /> {prompt.recommended_model}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-sora font-bold text-sm mb-2 leading-snug">{prompt.title}</h3>
        {prompt.description && (
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">{prompt.description}</p>
        )}
        {(prompt.tags || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {prompt.tags.slice(0, 4).map((t) => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{t}</span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="w-3 h-3 text-primary" />
            <span>Full prompt inside vault</span>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            Preview {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
        {expanded && (
          <div className="mt-3 p-3 rounded-lg bg-background/60 border border-border">
            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-6 italic">
              "{prompt.prompt_body?.substring(0, 300)}…"
            </p>
            <p className="text-[10px] text-primary/60 mt-2">Purchase to access the full prompt →</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PromptVaultDetails({ onBuy, price }) {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState("all");

  useEffect(() => {
    base44.entities.VaultPrompt.filter({ published: true }, "order", 50)
      .then(setPrompts)
      .finally(() => setLoading(false));
  }, []);

  const categories = ["all", ...Array.from(new Set(prompts.map((p) => p.category).filter(Boolean)))];
  const filtered = filterCat === "all" ? prompts : prompts.filter((p) => p.category === filterCat);

  return (
    <div className="mt-20">
      {/* Section header */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">What's Inside</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-4">
          Every prompt in the vault
        </h2>
        <p className="text-muted-foreground">
          {prompts.length}+ expert-crafted prompts. Titles and descriptions shown — full prompt bodies unlocked after purchase.
        </p>
      </div>

      {/* Category filter */}
      {!loading && (
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCat(c)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filterCat === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {c === "all" ? `All (${prompts.length})` : c}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading prompts…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p, i) => (
            <PromptCard key={p.id} prompt={p} index={i} />
          ))}
        </div>
      )}

      {/* Buy CTA mid-page */}
      <div className="mt-14 rounded-2xl border border-primary/20 bg-primary/5 p-10 text-center">
        <h3 className="font-sora font-bold text-2xl mb-2">Unlock all {prompts.length} prompts</h3>
        <p className="text-muted-foreground text-sm mb-6">One-time payment. Lifetime access. New prompts added free.</p>
        <button
          onClick={onBuy}
          className="inline-flex items-center gap-2 font-bold text-base px-8 py-3 rounded-lg bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90 transition-opacity"
        >
          Get Lifetime Access — {price}
        </button>
        <p className="text-xs text-muted-foreground mt-3">Normally $10 · 50% off launch price</p>
      </div>
    </div>
  );
}