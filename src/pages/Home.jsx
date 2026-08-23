import React, { useState, useEffect } from "react";
import Seo from "@/components/seo/Seo";
import GlitchPreloader from "@/components/landing/GlitchPreloader";
import { SITE, softwareApplicationSchema, faqSchema } from "@/lib/seo";
import { faqs } from "@/components/landing/FAQ";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import HeroStats from "@/components/landing/HeroStats";
import MigrationLastChance from "@/components/landing/MigrationLastChance";
import LatestVideos from "@/components/landing/LatestVideos";
import ServicesSection from "@/components/landing/ServicesSection";
import ExploreResources from "@/components/landing/ExploreResources";
import PromptsSection from "@/components/landing/PromptsSection";
import FAQ from "@/components/landing/FAQ";
import Testimonials from "@/components/landing/Testimonials";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";
import WhatsAppButton from "@/components/shared/WhatsAppButton";

export default function Home() {
  const [loading, setLoading] = useState(true);

  const handleComplete = () => {
    setLoading(false);
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground font-inter antialiased overflow-x-hidden">
      {loading && <GlitchPreloader onComplete={handleComplete} />}
      <Seo
        title="Base44 Expert - Will Kode - Become a Base44 Expert | Kodebase"
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
        <LatestVideos />
        <ServicesSection />
        <ExploreResources />
        <PromptsSection />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}