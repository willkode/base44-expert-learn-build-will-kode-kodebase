import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Star } from "lucide-react";

export default function PromptCard({ prompt, unlocked, onCopyRequest }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!unlocked) {
      onCopyRequest(() => doCopy());
      return;
    }
    doCopy();
  };

  const doCopy = () => {
    navigator.clipboard.writeText(prompt.promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col rounded-2xl border border-border bg-card/70 p-6 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-3">
        <Badge variant="secondary" className="text-xs">{prompt.category}</Badge>
        {prompt.featured && (
          <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
            <Star className="w-3 h-3 fill-primary" /> Featured
          </span>
        )}
      </div>

      <h3 className="font-sora font-bold text-lg mb-2">{prompt.title}</h3>
      {prompt.description && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{prompt.description}</p>
      )}

      <div className="relative mt-auto">
        <pre className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-3 max-h-32 overflow-hidden whitespace-pre-wrap font-inter leading-relaxed">
          {prompt.promptText}
        </pre>
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card/90 to-transparent rounded-b-lg" />
      </div>

      <Button
        onClick={handleCopy}
        variant="outline"
        size="sm"
        className="mt-4 w-full font-semibold"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-1 text-green-500" /> Copied
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-1" /> Copy prompt
          </>
        )}
      </Button>
    </motion.div>
  );
}