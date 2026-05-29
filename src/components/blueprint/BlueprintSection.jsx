import React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Markdown from "./Markdown";

export default function BlueprintSection({ title, description, content, children }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const text = content || "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Section copied");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-2xl border border-border bg-card/70 p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="font-sora font-semibold text-lg">{title}</h2>
          {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {content != null && (
          <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
            {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />} Copy
          </Button>
        )}
      </div>
      {children || <Markdown content={content} />}
    </div>
  );
}