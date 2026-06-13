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
        title="Free Base44 Prompt Library — Copy & Paste | KodeBase"
        description="A curated collection of battle-tested Base44 prompts you can copy and paste into your builds. Free, organized by category."
        path="/learn/prompt-library"
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
            <div className="mt-3 flex justify-center gap-3">
              <a href="https://buymeacoffee.com/willkode" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="font-semibold gap-2">
                  <Coffee className="w-5 h-5" />
                  Buy me a coffee
                </Button>
              </a>
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] hover:opacity-90 text-white font-semibold border-0"
              >
                <a href="https://discord.com/invite/cwEv93EwBA" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 mr-1" fill="currentColor" aria-hidden="true">
                    <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.6 12.6 0 0 0-.617-1.249.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.056c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028ZM8.02 15.331c-1.182 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.332-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.332-.946 2.418-2.157 2.418Z" />
                  </svg>
                  Join our Discord
                </a>
              </Button>
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