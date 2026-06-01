import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SocialLinks from "@/components/landing/SocialLinks";

const links = [
  { label: "How It Works", href: "#how" },
  { label: "Agents", href: "#agents" },
  { label: "Blueprint", href: "#blueprint" },
  { label: "Pricing", href: "#pricing" },
];

const learnLinks = [
  { label: "Blog", to: "/learn/blog" },
  { label: "Prompt Library", to: "/learn/prompt-library" },
  { label: "Agent Skills", to: "/learn/agent-skills" },
  { label: "SuperAgent", to: "/learn/superagent" },
  { label: "Videos", to: "/learn/videos" },
  { label: "Events", to: "/learn/events" },
  { label: "LLM Guide", to: "/learn/llm-guide" },
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
           <img src="https://media.base44.com/images/public/6a1905a0bc76553d6c934574/7ac1b8038_7feb47fe7_kode-base-logo-white.png" alt="KodeBase" className="h-9 w-auto group-hover:scale-105 transition-transform" />
           <span className="font-sora font-bold text-lg tracking-tight">
             <span className="text-white">KODE</span>
             <span className="text-primary">BASE</span>
           </span>
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
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50 focus:outline-none">
              Learn
              <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {learnLinks.map((l) => (
                <DropdownMenuItem key={l.to} asChild>
                  <Link to={l.to} className="cursor-pointer">{l.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <SocialLinks className="mr-1" />
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
          <div className="pt-2 pb-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">Learn</p>
            {learnLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2.5 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="pt-3 flex justify-center">
            <SocialLinks />
          </div>
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