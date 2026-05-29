import React from "react";
import PricingSection from "@/components/landing/Pricing";
import Seo from "@/components/seo/Seo";
import { softwareApplicationSchema } from "@/lib/seo";

export default function Pricing() {
  return (
    <>
      <Seo
        title="Pricing — ForgeBase"
        description="Simple plans from $12.99/mo. Full prompt packs, security reviews, QA checklists, and client-ready exports. Build right the first time."
        path="/pricing"
        type="website"
        jsonLd={[softwareApplicationSchema()]}
      />
      <PricingSection />
    </>
  );
}