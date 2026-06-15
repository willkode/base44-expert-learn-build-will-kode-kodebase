import React, { useEffect } from "react";
import Seo from "@/components/seo/Seo";
import { softwareApplicationSchema, faqSchema } from "@/lib/seo";
import { faqs } from "@/components/landing/FAQ";
import { trackEvent } from "@/lib/analytics";
import Navbar from "@/components/landing/Navbar";
import BlueprintHero from "@/components/landing/BlueprintHero";
import HowItWorks from "@/components/landing/HowItWorks";
import Workspace from "@/components/landing/Workspace";
import Agents from "@/components/landing/Agents";
import Blueprint from "@/components/landing/Blueprint";
import BlueprintShowcase from "@/components/landing/BlueprintShowcase";
import Platforms from "@/components/landing/Platforms";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

const OG_IMAGE = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/6935b73f9_generated_image.png";

export default function BlueprintTool() {
  useEffect(() => {
    trackEvent("view_blueprint_landing", { page_path: "/tools/blueprint" });
  }, []);

  return (
    <div className="dark min-h-screen bg-background text-foreground font-inter antialiased overflow-x-hidden">
      <Seo
        title="Base44 Blueprint Tool — Plan Your App Before You Build | KodeBase"
        description="Turn your app idea into a complete, builder-ready blueprint: data model, roles, permissions, page map, build phases, and copy-paste Base44 prompts. Ready in minutes."
        path="/tools/blueprint"
        type="website"
        image={OG_IMAGE}
        jsonLd={[softwareApplicationSchema(), faqSchema(faqs)]}
      />
      <Navbar />
      <main>
        <BlueprintHero />
        <HowItWorks />
        <Workspace />
        <Agents />
        <Blueprint />
        <BlueprintShowcase />
        <Platforms />
        <Pricing />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}