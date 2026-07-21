import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

// Collects guest details before service checkout — no account required.
export default function GuestCheckoutDialog({ open, onOpenChange, serviceId, onSubmit, loading, error }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [appUrl, setAppUrl] = useState("");
  const needsAppUrl = (serviceId || "").startsWith("er_");

  const canSubmit = name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && (!needsAppUrl || appUrl.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sora">Your details</DialogTitle>
          <DialogDescription>
            No account needed — just tell us where to send your report.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit && !loading) onSubmit({ name: name.trim(), email: email.trim(), appUrl: appUrl.trim() });
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="guest-name">Name</Label>
            <Input id="guest-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="guest-email">Email</Label>
            <Input id="guest-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          {needsAppUrl && (
            <div className="space-y-1.5">
              <Label htmlFor="guest-app-url">Your app URL</Label>
              <Input id="guest-app-url" value={appUrl} onChange={(e) => setAppUrl(e.target.value)} placeholder="https://your-app.base44.app" required />
            </div>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" size="lg" disabled={!canSubmit || loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Redirecting to checkout…
              </>
            ) : (
              "Continue to payment"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}