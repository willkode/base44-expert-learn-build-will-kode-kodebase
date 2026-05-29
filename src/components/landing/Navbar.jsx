import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Compass, Menu, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const links = [
  { label: "How It Works", href: "#how" },
  { label: "Agents", href: "#agents" },
  { label: "Blueprint", href: "#blueprint" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const getStarted = () => base44.auth.redirectToLogin();

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center glow-orange">
            <Compass className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-sora font-bold text-lg tracking-tight">Kode Architect</span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" onClick={getStarted} className="text-muted-foreground hover:text-foreground">
            Sign In
          </Button>
          <Button onClick={getStarted} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            Get Started
          </Button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border px-6 py-4 space-y-3">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-sm font-medium text-muted-foreground hover:text-foreground py-1"
            >
              {l.label}
            </a>
          ))}
          <Button onClick={getStarted} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            Get Started
          </Button>
        </div>
      )}
    </header>
  );
}