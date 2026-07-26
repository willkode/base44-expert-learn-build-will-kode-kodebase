import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const TEMPLATE = `[
  {
    "title": "Short internal label for this post",
    "caption": "The full post text exactly as it should be published.\\n\\nUse \\\\n\\\\n for blank lines between paragraphs. Include hashtags in the caption if you want them.",
    "imageUrl": "https://example.com/optional-image.png",
    "imagePrompt": "Optional AI image prompt used if you regenerate the image later"
  },
  {
    "title": "Second post",
    "caption": "Only \\"caption\\" is required — title, imageUrl, and imagePrompt are optional."
  }
]`;

// Parses pasted JSON into clean draft rows, or throws a friendly error.
function parsePosts(raw) {
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("That's not valid JSON. Check for missing commas, quotes, or brackets.");
  }
  if (!Array.isArray(data)) throw new Error("The JSON must be an array of posts: [ { ... }, { ... } ]");
  if (data.length === 0) throw new Error("The array is empty — add at least one post.");
  if (data.length > 50) throw new Error("Maximum 50 posts per import.");
  return data.map((p, i) => {
    if (!p || typeof p !== "object") throw new Error(`Item ${i + 1} is not an object.`);
    if (typeof p.caption !== "string" || !p.caption.trim()) throw new Error(`Item ${i + 1} is missing a "caption".`);
    return {
      source: "create",
      ideaTitle: (p.title || "").toString().trim() || `Imported post ${i + 1}`,
      instructions: "Bulk JSON import",
      caption: p.caption.trim(),
      imageUrl: (p.imageUrl || "").toString().trim(),
      imagePrompt: (p.imagePrompt || "").toString().trim(),
      status: "ready",
    };
  });
}

export default function OcoyaBulkImport() {
  const [raw, setRaw] = useState("");
  const [copied, setCopied] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [importedCount, setImportedCount] = useState(0);

  const copyTemplate = async () => {
    await navigator.clipboard.writeText(TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = async () => {
    setError(null);
    setImportedCount(0);
    let posts;
    try {
      posts = parsePosts(raw);
    } catch (e) {
      setError(e.message);
      return;
    }
    setImporting(true);
    try {
      await base44.entities.OcoyaDraft.bulkCreate(posts);
      setImportedCount(posts.length);
      setRaw("");
      trackEvent("ocoya_bulk_import", { post_count: posts.length });
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Import failed. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Template */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-sora font-semibold mb-1">JSON template</h3>
            <p className="text-xs text-muted-foreground">
              Copy this structure, fill it with your posts, and paste it below. Only <span className="font-semibold text-foreground">caption</span> is required per post — max 50 posts at a time.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={copyTemplate} className="shrink-0">
            {copied ? <Check className="w-4 h-4 mr-1.5 text-primary" /> : <Copy className="w-4 h-4 mr-1.5" />}
            {copied ? "Copied!" : "Copy template"}
          </Button>
        </div>
        <pre className="rounded-lg bg-secondary/60 border border-border p-4 text-xs overflow-x-auto whitespace-pre text-muted-foreground">{TEMPLATE}</pre>
      </div>

      {/* Paste + import */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div>
          <h3 className="font-sora font-semibold mb-1">Paste your posts</h3>
          <p className="text-xs text-muted-foreground">
            Imported posts are saved as ready drafts — review, edit, schedule, or publish them from the <span className="font-semibold text-foreground">AI Suggest</span> tab under "Review &amp; approve".
          </p>
        </div>
        <Textarea
          value={raw}
          onChange={(e) => { setRaw(e.target.value); setImportedCount(0); }}
          placeholder='[ { "title": "...", "caption": "..." } ]'
          rows={12}
          className="font-mono text-xs"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        {importedCount > 0 && (
          <p className="text-sm text-primary flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Imported {importedCount} post{importedCount === 1 ? "" : "s"} as ready drafts.
          </p>
        )}
        <Button onClick={handleImport} disabled={importing || !raw.trim()}>
          {importing ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Upload className="w-4 h-4 mr-1.5" />}
          {importing ? "Importing..." : "Import posts"}
        </Button>
      </div>
    </div>
  );
}