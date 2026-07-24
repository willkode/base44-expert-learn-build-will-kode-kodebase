import React, { useState, useEffect } from "react";
import Seo from "@/components/seo/Seo";
import GlitchPreloader from "@/components/landing/GlitchPreloader";
import { SITE, softwareApplicationSchema, faqSchema } from "@/lib/seo";
import { faqs } from "@/components/landing/FAQ";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import HeroStats from "@/components/landing/HeroStats";
import MigrationLastChance from "@/components/landing/MigrationLastChance";
import ExploreResources from "@/components/landing/ExploreResources";
import ToolsSection from "@/components/landing/ToolsSection";
import PromptsSection from "@/components/landing/PromptsSection";
import FAQ from "@/components/landing/FAQ";
import Testimonials from "@/components/landing/Testimonials";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  const [loading, setLoading] = useState(true);

  const handleComplete = () => {
    setLoading(false);
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground font-inter antialiased overflow-x-hidden">
      {loading && <GlitchPreloader onComplete={handleComplete} />}
      <Seo
        title="KodeBase — Plan Before You Build"
        description={SITE.description}
        path="/"
        type="website"
        jsonLd={[softwareApplicationSchema(), faqSchema(faqs)]}
      />
      <Navbar />
      <main>
        <Hero />
        <MigrationLastChance />
        <HeroStats />
        <ExploreResources />
        <ToolsSection />
        <PromptsSection />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}