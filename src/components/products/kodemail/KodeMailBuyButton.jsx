import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { trackCTA } from "@/lib/analytics";
import { KODEMAIL_PRODUCT_ID, KODEMAIL_PRICE } from "./kodeMailData";

export default function KodeMailBuyButton({ location, label = `Get KodeMail — $${KODEMAIL_PRICE}`, className = "" }) {
  const navigate = useNavigate();

  const handleClick = async () => {
    trackCTA({ text: label, location, destination: "/checkout" });
    const authed = await base44.auth.isAuthenticated();
    if (!authed) {
      navigate("/register?next=/products/kodemail");
      return;
    }
    navigate(`/checkout?product=${KODEMAIL_PRODUCT_ID}`);
  };

  return (
    <Button
      onClick={handleClick}
      size="lg"
      className={`font-bold text-base px-8 py-6 bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90 glow-orange ${className}`}
    >
      {label}
    </Button>
  );
}