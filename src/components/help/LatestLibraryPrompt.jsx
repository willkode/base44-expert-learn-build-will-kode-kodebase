import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Copy, Check, ArrowRight } from "lucide-react";

export default function LatestLibraryPrompt() {
  const [prompt, setPrompt] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    base44.entities.LibraryPrompt.list("-created_date", 1).then((res) => setPrompt(res[0] || null));
  }, []);

  if (!prompt) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-8 rounded-2xl border border-border bg-card/60 p-6">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Latest from the Prompt Library</p>
            <h2 className="font-sora font-semibold text-lg">{prompt.title}</h2>
          </div>
        </div>
        <Badge variant="secondary">{prompt.category}</Badge>
      </div>
      {prompt.description && (
        <p className="text-sm text-muted-foreground mb-3">{prompt.description}</p>
      )}
      <pre className="text-xs text-muted-foreground bg-background/60 border border-border rounded-xl p-4 whitespace-pre-wrap max-h-48 overflow-y-auto mb-4">
        {prompt.promptText}
      </pre>
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={handleCopy}>
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied" : "Copy prompt"}
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link to="/learn/prompt-library">
            Browse library <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}