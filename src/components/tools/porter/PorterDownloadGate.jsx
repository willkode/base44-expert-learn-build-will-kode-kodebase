import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { DOWNLOAD_URL } from "./porterData";
import { trackNewsletterSignup, trackFormSubmit, trackFormError, trackCTA, trackLead } from "@/lib/analytics";

const STORAGE_KEY = "porterToolUnlocked";

export default function PorterDownloadGate() {
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setUnlocked(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      trackFormError("porter_tool_gate", "invalid_email");
      return;
    }
    setLoading(true);
    try {
      const existing = await base44.entities.NewsletterSubscriber.filter({ email: trimmed });
      if (existing.length === 0) {
        await base44.entities.NewsletterSubscriber.create({ email: trimmed, source: "porter_tool" });
      }
    } catch {
      setLoading(false);
      setError("Something went wrong. Please try again.");
      trackFormError("porter_tool_gate", "save_failed");
      return;
    }
    setLoading(false);
    localStorage.setItem(STORAGE_KEY, "true");
    setUnlocked(true);
    trackFormSubmit("porter_tool_gate");
    trackNewsletterSignup("porter_tool");
    trackLead({ leadType: "free_tool_download", formName: "porter_tool_gate" });
  };

  return (
    <section id="download" className="max-w-3xl mx-auto px-4 py-16">
      <div className="rounded-3xl border border-primary/30 bg-card p-8 md:p-10 text-center glow-orange">
        {unlocked ? (
          <>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-primary" />
            </div>
            <h2 className="mt-4 font-sora text-3xl font-bold">You're in — grab the tool</h2>
            <p className="mt-2 text-muted-foreground">
              The download folder includes the app, setup notes and docs/CLI_FINDINGS.md with every
              measurement and repro step.
            </p>
            <Button
              asChild
              className="mt-6 font-semibold bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] hover:opacity-90 text-white border-0"
              onClick={() =>
                trackCTA({ text: "Download the tool", location: "porter_gate", destination: DOWNLOAD_URL })
              }
            >
              <a href={DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-1" /> Download the tool
              </a>
            </Button>
          </>
        ) : (
          <>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
              <Mail className="w-7 h-7 text-primary" />
            </div>
            <h2 className="mt-4 font-sora text-3xl font-bold">Download it free</h2>
            <p className="mt-2 text-muted-foreground">
              Join the newsletter and the download link appears instantly. You'll also get new Base44
              tools, findings and guides as I ship them. No spam, unsubscribe anytime.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading} className="font-semibold">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe & download"}
              </Button>
            </form>
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          </>
        )}
      </div>
    </section>
  );
}