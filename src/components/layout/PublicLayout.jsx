import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function PublicLayout() {
  return (
    <div className="dark min-h-screen bg-background text-foreground font-inter overflow-x-hidden">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}