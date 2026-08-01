import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowRight, Lock } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { GROWTH_OPTIONS } from "@/components/services/growth/growthOptions";

export default function GrowthSessionForm({ defaultOption = "growth_strategy_session" }) {
  const [form, setForm] = useState({ name: "", email: "", appUrl: "", message: "" });
  const [option, setOption] = useState(defaultOption);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const selected = GROWTH_OPTIONS.find((o) => o.id === option);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || form.name.trim().length < 2) return setError("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setError("Please enter a valid email address.");
    if (form.message.trim().length < 10) return setError("Tell me a bit about your app (at least 10 characters).");

    setLoading(true);
    trackEvent("begin_checkout", { checkout_type: "growth_consulting", service_id: option });
    try {
      await base44.functions.invoke("submitContactForm", {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: `Growth Consulting — ${selected?.name} (${selected?.price})`,
        message: `Package: ${selected?.name} (${selected?.price})\nApp URL: ${form.appUrl.trim() || "not provided"}\n\n${form.message.trim()}`,
      });

      const response = await base44.functions.invoke("createSquareCheckoutLink", {
        serviceId: option,
        guestName: form.name.trim(),
        guestEmail: form.email.trim(),
        appUrl: form.appUrl.trim(),
        redirectUrl: `${window.location.origin}/services/thank-you?service=${encodeURIComponent(option)}`,
      });
      const { checkoutUrl, error: apiError } = response.data;
      if (apiError) throw new Error(apiError);
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card/60 p-6 md:p-8 space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="growth-name">Your name</Label>
          <Input id="growth-name" value={form.name} onChange={set("name")} placeholder="Jane Founder" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="growth-email">Email</Label>
          <Input id="growth-email" type="email" value={form.email} onChange={set("email")} placeholder="jane@yourapp.com" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="growth-url">Your app URL <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Input id="growth-url" value={form.appUrl} onChange={set("appUrl")} placeholder="https://yourapp.base44.app" />
      </div>

      <div className="space-y-2">
        <Label>Which engagement do you want?</Label>
        <Select value={option} onValueChange={setOption}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {GROWTH_OPTIONS.map((o) => (
              <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="growth-message">What are you trying to grow?</Label>
        <Textarea
          id="growth-message"
          rows={4}
          value={form.message}
          onChange={set("message")}
          placeholder="What your app does, who it's for, where you're stuck (traffic, signups, pricing, conversions)…"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending you to secure checkout…</>
        ) : (
          <>Continue to Payment — {selected?.price} <ArrowRight className="w-4 h-4 ml-1" /></>
        )}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="w-3 h-3" /> Secure payment via Square. I'll email you within 24 hours to schedule.
      </p>
    </form>
  );
}