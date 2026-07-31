import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { trackEvent } from "@/lib/analytics";

const PRO_SLUG = "desktop-pro-access";

// Sends the buyer straight to Square checkout for the $15 lifetime Desktop Pro
// product. Guests are routed to login first, then returned here to pay.
export default function DesktopProCheckoutButton({ label, className = "" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    setError(null);
    setLoading(true);
    trackEvent("begin_checkout", { checkout_type: "product", product_slug: PRO_SLUG });
    try {
      const isAuthed = await base44.auth.isAuthenticated();
      if (!isAuthed) {
        window.location.href = `/login?returnTo=${encodeURIComponent(window.location.pathname + "#pricing")}`;
        return;
      }
      const products = await base44.entities.Product.filter({ slug: PRO_SLUG });
      const product = products[0];
      if (!product) throw new Error("Lifetime access is not available right now.");
      const res = await base44.functions.invoke("createSquareCheckoutLink", {
        productId: product.id,
        redirectUrl: `${window.location.origin}/dashboard?purchase=${product.id}`,
      });
      const { checkoutUrl, error: apiError } = res.data;
      if (apiError) throw new Error(apiError);
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Button size="lg" onClick={handleClick} disabled={loading} className={className}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecting to checkout…
          </>
        ) : (
          label
        )}
      </Button>
      {error && <p className="mt-2 text-xs text-destructive text-center">{error}</p>}
    </div>
  );
}