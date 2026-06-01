import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Library, Coffee } from "lucide-react";
import Seo from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import PromptCard from "@/components/learn/PromptCard";
import NewsletterGateDialog from "@/components/learn/NewsletterGateDialog";
import LoadingState from "@/components/shared/LoadingState";

const STORAGE_KEY = "kb_newsletter_subscribed";

export default function PromptLibrary() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [unlocked, setUnlocked] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const pendingCopy = useRef(null);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) setUnlocked(true);
    base44.entities.LibraryPrompt.list("order").then((data) => {
      setPrompts(data);
      setLoading(false);
    });
  }, []);

  const categories = ["All", ...Array.from(new Set(prompts.map((p) => p.category)))];
  const filtered =
    activeCategory === "All"
      ? prompts
      : prompts.filter((p) => p.category === activeCategory);

  const handleCopyRequest = (doCopy) => {
    pendingCopy.current = doCopy;
    setGateOpen(true);
  };

  const handleSubscribed = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setUnlocked(true);
    if (pendingCopy.current) {
      pendingCopy.current();
      pendingCopy.current = null;
    }
  };

  return (
    <>
      <Seo
        title="Prompt Library — KodeBase"
        description="A curated collection of battle-tested Base44 prompts you can copy and paste into your builds."
      />

      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-30" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-7">
              <Library className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-sora font-extrabold text-4xl md:text-5xl tracking-tight mb-5">
              Prompt <span className="text-gradient-orange">Library</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A curated collection of battle-tested Base44 prompts. Copy, paste, and build faster.
            </p>
            <p className="mt-6 text-sm text-muted-foreground">
              Help support the work I do
            </p>
            <div className="mt-3 flex justify-center">
              <a href="https://buymeacoffee.com/willkode" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="font-semibold gap-2">
                  <Coffee className="w-5 h-5" />
                  Buy me a coffee
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        {loading ? (
          <LoadingState />
        ) : (
          <>
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  variant={activeCategory === cat ? "default" : "outline"}
                  size="sm"
                  className="font-medium"
                >
                  {cat}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  unlocked={unlocked}
                  onCopyRequest={handleCopyRequest}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <NewsletterGateDialog
        open={gateOpen}
        onOpenChange={setGateOpen}
        onSubscribed={handleSubscribed}
      />
    </>
  );
}