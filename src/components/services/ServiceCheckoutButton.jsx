import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import GuestCheckoutDialog from "@/components/services/GuestCheckoutDialog";
import { trackEvent } from "@/lib/analytics";

/**
 * Handles dynamic Square checkout for service pages.
 * - Logged-in users go straight to checkout (redirect → service onboarding).
 * - Guests get a quick name/email (+ app URL for ER) form — no signup needed —
 *   then are redirected to a public thank-you page after payment.
 */
export default function ServiceCheckoutButton({ serviceId, label, size = "lg", className = "", onClick, redirectPath }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [guestOpen, setGuestOpen] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState(null);

  const startCheckout = async (payload, redirectUrl) => {
    const response = await base44.functions.invoke("createSquareCheckoutLink", {
      serviceId,
      redirectUrl,
      ...payload,
    });
    const { checkoutUrl, error: apiError } = response.data;
    if (apiError) throw new Error(apiError);
    window.location.href = checkoutUrl;
  };

  const handleClick = async () => {
    if (onClick) onClick();
    trackEvent("begin_checkout", { checkout_type: "service", service_id: serviceId });
    setError(null);
    setLoading(true);
    try {
      const isAuthed = await base44.auth.isAuthenticated();
      if (!isAuthed) {
        setLoading(false);
        setGuestError(null);
        setGuestOpen(true);
        return;
      }
      const onboardingUrl = redirectPath
        ? `${window.location.origin}${redirectPath}`
        : `${window.location.origin}/service-onboarding?service=${encodeURIComponent(serviceId)}`;
      await startCheckout({}, onboardingUrl);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleGuestSubmit = async ({ name, email, appUrl }) => {
    setGuestError(null);
    setGuestLoading(true);
    trackEvent("add_payment_info", { checkout_type: "service_guest", service_id: serviceId, payment_type: "square_hosted_checkout" });
    try {
      const thankYouUrl = redirectPath
        ? `${window.location.origin}${redirectPath}`
        : `${window.location.origin}/services/thank-you?service=${encodeURIComponent(serviceId)}`;
      await startCheckout({ guestName: name, guestEmail: email, appUrl }, thankYouUrl);
    } catch (err) {
      setGuestError(err.message || "Something went wrong. Please try again.");
      setGuestLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Button
        size={size}
        className={`w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold ${className}`}
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Redirecting to checkout…
          </>
        ) : (
          label
        )}
      </Button>
      {error && <p className="mt-2 text-xs text-destructive text-center">{error}</p>}
      <GuestCheckoutDialog
        open={guestOpen}
        onOpenChange={setGuestOpen}
        serviceId={serviceId}
        onSubmit={handleGuestSubmit}
        loading={guestLoading}
        error={guestError}
      />
    </div>
  );
}