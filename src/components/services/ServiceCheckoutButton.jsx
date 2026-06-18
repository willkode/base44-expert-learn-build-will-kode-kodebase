import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

/**
 * Handles dynamic Square checkout for service pages.
 * - Unauthenticated users are redirected to /login first (Square link needs user context).
 * - On success, redirects the browser to the Square-hosted checkout page.
 */
export default function ServiceCheckoutButton({ serviceId, label, size = "lg", className = "", onClick }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    if (onClick) onClick();
    setError(null);
    setLoading(true);
    try {
      const isAuthed = await base44.auth.isAuthenticated();
      if (!isAuthed) {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      const response = await base44.functions.invoke("createSquareCheckoutLink", {
        serviceId,
        redirectUrl: window.location.origin + "/dashboard",
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
    </div>
  );
}