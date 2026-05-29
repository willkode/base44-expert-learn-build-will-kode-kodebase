import React from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Problem from "@/components/landing/Problem";
import HowItWorks from "@/components/landing/HowItWorks";
import Workspace from "@/components/landing/Workspace";
import Agents from "@/components/landing/Agents";
import Blueprint from "@/components/landing/Blueprint";
import Platforms from "@/components/landing/Platforms";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="dark min-h-screen bg-background text-foreground font-inter antialiased overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Workspace />
        <Agents />
        <Blueprint />
        <Platforms />
        <Pricing />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}