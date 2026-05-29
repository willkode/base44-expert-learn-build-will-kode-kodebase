import React from "react";
import { Outlet } from "react-router-dom";
import PublicNav from "./PublicNav";
import Footer from "@/components/landing/Footer";

export default function PublicLayout() {
  return (
    <div className="dark min-h-screen bg-background text-foreground font-inter overflow-x-hidden">
      <PublicNav />
      <main className="pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}