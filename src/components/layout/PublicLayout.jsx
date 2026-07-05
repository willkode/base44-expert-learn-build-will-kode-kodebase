import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import NewsletterPopup from "@/components/newsletter/NewsletterPopup";
import { isSummerSaleActive } from "@/lib/summerSale";

export default function PublicLayout() {
  return (
    <div className="dark min-h-screen bg-background text-foreground font-inter antialiased overflow-x-hidden">
      <Navbar />
      <main className={isSummerSaleActive() ? "pt-[104px]" : "pt-16"}>
        <Outlet />
      </main>
      <Footer />
      <NewsletterPopup />
    </div>
  );
}