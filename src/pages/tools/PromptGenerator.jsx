import React, { useEffect } from "react";
import Seo from "@/components/seo/Seo";
import { softwareApplicationSchema, faqSchema } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PromptEngineHero from "@/components/landing/promptengine/PromptEngineHero";
import PromptEngineHowItWorks from "@/components/landing/promptengine/PromptEngineHowItWorks";
import PromptEngineFeatures from "@/components/landing/promptengine/PromptEngineFeatures";
import PromptEngineFAQ, { promptEngineFaqs } from "@/components/landing/promptengine/PromptEngineFAQ";
import PromptEngineCTA from "@/components/landing/promptengine/PromptEngineCTA";

const OG_IMAGE = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/991873621_generated_image.png";

export default function PromptGenerator() {
  useEffect(() => {
    trackEvent("view_prompt_engine_landing", { page_path: "/tools/prompt-generator" });
  }, []);

  return (
    <div className="dark min-h-screen bg-background text-foreground font-inter antialiased overflow-x-hidden">
      <Seo
        title="Prompt Engine — Turn Your App Idea Into a Ready-to-Build Prompt Pack | KodeBase"
        description="Chat through your app idea and instantly generate an ordered pack of production-grade build, QA, and security prompts — sequenced foundation-first and ready to paste into Base44. One-time $10, saved to your account forever."
        path="/tools/prompt-generator"
        type="website"
        image={OG_IMAGE}
        jsonLd={[softwareApplicationSchema(), faqSchema(promptEngineFaqs)]}
      />
      <Navbar />
      <main>
        <PromptEngineHero />
        <PromptEngineHowItWorks />
        <PromptEngineFeatures />
        <PromptEngineFAQ />
        <PromptEngineCTA />
      </main>
      <Footer />
    </div>
  );
}