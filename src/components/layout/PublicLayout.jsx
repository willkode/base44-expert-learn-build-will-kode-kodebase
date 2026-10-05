import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import NewsletterPopup from "@/components/newsletter/NewsletterPopup";
import WhatsAppButton from "@/components/shared/WhatsAppButton";
import { isSummerSaleActive } from "@/lib/summerSale";

export default function PublicLayout() {
  const { pathname } = useLocation();
  const isMigrationPage = pathname === "/services/base44-migration";
  return (
    <div className="dark min-h-screen bg-background text-foreground font-inter antialiased overflow-x-hidden">
      <Navbar />
      <main className={isSummerSaleActive() ? "pt-[104px]" : "pt-16"}>
        <Outlet />
      </main>
      <Footer />
      {!isMigrationPage && <NewsletterPopup />}
      <WhatsAppButton />
    </div>
  );
}