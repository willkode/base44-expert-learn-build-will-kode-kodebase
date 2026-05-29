import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Compass, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const links = [
  { label: "Features", to: "/features" },
  { label: "Pricing", to: "/pricing" },
];

export default function PublicNav() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const login = () => navigate("/register");

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Compass className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-sora font-bold text-lg tracking-tight">Base44 Architect</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate("/login")} className="text-muted-foreground hover:text-foreground">Sign In</Button>
          <Button onClick={login} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">Get Started</Button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border px-6 py-4 space-y-3">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-foreground py-1">
              {l.label}
            </Link>
          ))}
          <Button onClick={login} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">Get Started</Button>
        </div>
      )}
    </header>
  );
}