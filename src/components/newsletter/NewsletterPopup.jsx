import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, CheckCircle2, X } from "lucide-react";
import { trackNewsletterSignup } from "@/lib/analytics";

const STORAGE_KEY = "kb_newsletter_popup_v1";
const CODE_IMAGE = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/49db573dd_generated_image.png";
const SHOW_DELAY_MS = 6000;

export default function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return; // already subscribed or dismissed
    const timer = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    const existing = await base44.entities.NewsletterSubscriber.filter({ email: trimmed });
    if (existing.length === 0) {
      await base44.entities.NewsletterSubscriber.create({ email: trimmed, source: "popup" });
    }
    setLoading(false);
    trackNewsletterSignup("popup");
    localStorage.setItem(STORAGE_KEY, "subscribed");
    setDone(true);
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={dismiss}
      />
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl grid grid-cols-1 md:grid-cols-2">
        {/* Left: code image */}
        <div className="hidden md:block relative">
          <img src={CODE_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover" />
        </div>

        {/* Right: form */}
        <div className="relative p-7 sm:p-8">
          <button
            onClick={dismiss}
            aria-label="Close"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {done ? (
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-sora font-bold text-2xl mb-2">You're in!</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Thanks for subscribing — keep an eye on your inbox.
              </p>
              <Button onClick={() => setOpen(false)} className="w-full font-semibold">
                Done
              </Button>
            </div>
          ) : (
            <>
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-sora font-bold text-2xl mb-2">Join the KodeBase Newsletter</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Get the latest tutorials, prompts, tools, and behind-the-scenes builds — straight to your inbox.
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  type="text"
                  placeholder="First name (optional)"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full font-semibold">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
                </Button>
                <p className="text-xs text-muted-foreground text-center pt-1">
                  No spam. Unsubscribe anytime.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}