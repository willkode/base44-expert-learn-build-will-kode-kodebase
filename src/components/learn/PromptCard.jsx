import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Star, ArrowRight } from "lucide-react";

const CATEGORY_IMAGES = {
  "App Building": "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/e5af6c698_generated_image.png",
  Workflow: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/3386b9868_generated_image.png",
  Marketing: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/014929e53_generated_image.png",
  Optimization: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/e997d740a_generated_image.png",
  Debugging: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/de50230f2_generated_image.png",
  "QA & Testing": "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/324b52fa6_generated_image.png",
};
const DEFAULT_IMAGE = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/5caf73316_generated_image.png";

export default function PromptCard({ prompt, unlocked, onCopyRequest }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
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
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card/70 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
    >
      {prompt.slug && (
        <Link
          to={`/learn/prompt-library/${prompt.slug}`}
          className="absolute inset-0 z-10"
          aria-label={`Read guide: ${prompt.title}`}
        />
      )}
      <div className="relative h-36 overflow-hidden">
        <img
          src={prompt.imageUrl || CATEGORY_IMAGES[prompt.category] || DEFAULT_IMAGE}
          alt={prompt.category}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
      </div>

      <div className="flex flex-col flex-1 p-6">
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

      <div className="relative z-20 mt-4 flex gap-2">
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="flex-1 font-semibold"
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
        {prompt.slug && (
          <Button asChild variant="ghost" size="sm" className="font-semibold">
            <Link to={`/learn/prompt-library/${prompt.slug}`}>
              Guide <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        )}
      </div>
      </div>
    </motion.div>
  );
}