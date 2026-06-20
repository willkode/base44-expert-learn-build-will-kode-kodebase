import React, { useState, useEffect } from "react";
import { Phone, Loader2, CheckCircle2, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { trackEvent } from "@/lib/analytics";

const BOOKING_URL = "https://calendar.app.google/6UYFDc74UTQCkxdA7";

// Shown on the dashboard for Pro members only. One free 1hr call per month;
// after the credit is used, a discounted $75 paid call is offered.
export default function ProCallCard() {
  const [status, setStatus] = useState(null); // { isPro, hasFreeCredit, used, limit, paidPriceCents }
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [freeBooked, setFreeBooked] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    base44.functions
      .invoke("bookProCall", { action: "status" })
      .then((res) => setStatus(res.data))
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !status?.isPro) return null;

  const { hasFreeCredit, paidPriceCents } = status;
  const paidLabel = `$${((paidPriceCents || 7500) / 100).toFixed(0)}`;

  const handleBook = async () => {
    setBooking(true);
    setError(null);
    trackEvent("pro_call_request", { free: hasFreeCredit });
    try {
      const redirectUrl = `${window.location.origin}/service-onboarding?service=kode_session_1hr`;
      const res = await base44.functions.invoke("bookProCall", { action: "book", redirectUrl });
      if (res.data?.free) {
        setFreeBooked(true);
      } else if (res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
        return;
      } else {
        setError(res.data?.error || "Something went wrong. Please try again.");
      }
    } catch (_e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  if (freeBooked) {
    return (
      <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/15 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-sora font-bold text-lg mb-1">Free call unlocked — pick a time</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your free monthly 1-hour call is reserved. Choose a slot and Will will join ready to build.
            </p>
            <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("pro_call_booking_click")}>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                <Calendar className="w-4 h-4 mr-2" /> Pick a time with Will
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-amber-500/5 p-6">
      <div className="flex items-start gap-4 flex-wrap">
        <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          <Phone className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-[220px]">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-sora font-bold text-lg">Request a 1-hour call</h3>
            <span
              className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                hasFreeCredit ? "bg-green-500/15 text-green-400" : "bg-secondary text-muted-foreground"
              }`}
            >
              {hasFreeCredit ? "Free this month" : `${paidLabel} · Pro 40% off`}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {hasFreeCredit
              ? "Pro perk: one free 1-hour live call with Will every month. Use yours now."
              : `You've used this month's free call. Book another 1-hour session at your discounted Pro rate of ${paidLabel}.`}
          </p>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </div>
        <div className="shrink-0">
          <Button
            onClick={handleBook}
            disabled={booking}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            {booking ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Working…</>
            ) : hasFreeCredit ? (
              <>Use free call <ArrowRight className="w-4 h-4 ml-1" /></>
            ) : (
              <>Book for {paidLabel} <ArrowRight className="w-4 h-4 ml-1" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}