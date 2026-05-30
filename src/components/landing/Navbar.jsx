import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Hammer, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const links = [
  { label: "How It Works", href: "#how" },
  { label: "Agents", href: "#agents" },
  { label: "Blueprint", href: "#blueprint" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const getStarted = () => navigate("/register");
  const signIn = () => navigate("/login");
  const goDashboard = () => navigate("/dashboard");

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/70 backdrop-blur-xl border-b border-border shadow-lg shadow-black/20"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5 group">
           <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center glow-orange group-hover:scale-105 transition-transform">
             <Hammer className="w-5 h-5 text-primary-foreground" />
           </div>
           <span className="font-sora font-bold text-lg tracking-tight">KodeBase</span>
         </a>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" onClick={() => logout()} className="text-muted-foreground hover:text-foreground">
                Logout
              </Button>
              <Button onClick={goDashboard} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-transform hover:-translate-y-0.5">
                Dashboard
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={signIn} className="text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
              <Button onClick={getStarted} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-transform hover:-translate-y-0.5">
                Get Started
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden text-foreground p-2 -mr-2 rounded-lg hover:bg-secondary/50 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border px-6 py-5 space-y-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2.5 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Button variant="outline" onClick={() => logout()} className="w-full">
                  Logout
                </Button>
                <Button onClick={goDashboard} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={signIn} className="w-full">
                  Sign In
                </Button>
                <Button onClick={getStarted} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}