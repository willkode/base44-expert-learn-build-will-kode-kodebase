import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { trackCTA } from "@/lib/analytics";
import { formatUsd, ALL_ACCESS_PRICE_CENTS, ALL_ACCESS_SLUG } from "@/lib/summerSale";

// One button, one behaviour, wherever the all-access offer is shown.
// `location` only labels the analytics event.
export default function AllAccessButton({ location, label, className = "", size = "lg" }) {
  const navigate = useNavigate();
  const [bundle, setBundle] = useState(null);

  useEffect(() => {
    base44.entities.Product.filter({ slug: ALL_ACCESS_SLUG, active: true })
      .then((items) => setBundle(items[0] || null))
      .catch(() => {});
  }, []);

  const text = label || `Get every product — ${formatUsd(ALL_ACCESS_PRICE_CENTS)}`;

  // Straight to checkout once the bundle has loaded; until then its product
  // page, so the button is never a dead click.
  const destination = bundle ? `/checkout?product=${bundle.id}` : `/products/${ALL_ACCESS_SLUG}`;

  const go = () => {
    trackCTA({ text, location, destination });
    navigate(destination);
  };

  return (
    <Button onClick={go} size={size} className={className}>
      {text}
      <ArrowRight className="w-4 h-4 ml-2" />
    </Button>
  );
}
