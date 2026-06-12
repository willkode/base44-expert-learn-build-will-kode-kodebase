import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function NewsletterGateDialog({ open, onOpenChange, onSubscribed }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      await base44.entities.NewsletterSubscriber.create({ email: trimmed, source: "prompt_library" });
    }
    setLoading(false);
    onSubscribed(trimmed);
    onOpenChange(false);
    setEmail("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="font-sora text-2xl">Unlock the full prompt library</DialogTitle>
          <DialogDescription className="text-base">
            Drop your email to copy prompts and get new Base44 prompts, guides, and templates
            straight to your inbox. No spam, unsubscribe anytime.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full font-semibold">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Subscribe & Copy
              </>
            )}
          </Button>
          <Button className="w-full font-semibold bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] hover:opacity-90 text-white border-0" asChild>
            <Link to="/register">
              Sign up for free <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
          </form>
          </DialogContent>
    </Dialog>
  );
}