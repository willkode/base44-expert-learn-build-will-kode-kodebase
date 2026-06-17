import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, FileText, Video, Sparkles, Library, Settings2, Bot, DraftingCompass, Wand2, Headphones, Wrench, Shield, TrendingUp, Monitor, Heart } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SocialLinks from "@/components/landing/SocialLinks";
import { trackCTA } from "@/lib/analytics";

const links = [
  { label: "Contact Me", to: "/contact" },
];

const toolItems = [
  { label: "App Blueprint", to: "/tools/blueprint", icon: DraftingCompass, desc: "Plan your entire app before you build it", badge: "NEW" },
  { label: "Prompt Engine", to: "/tools/prompt-generator", icon: Wand2, desc: "Turn your idea into an ordered prompt pack", badge: "NEW" },
];

const serviceItems = [
  { label: "Kode Sessions", to: "/services/kode-sessions", icon: Headphones, desc: "1-on-1 expert sessions" },
  { label: "ER Service", to: "/services/er-service", icon: Wrench, desc: "Emergency app repair" },
  { label: "Security Audit + Fix", to: "/services/security-audit", icon: Shield, desc: "Full security review" },
  { label: "SEO Audit + Fix", to: "/services/seo-audit", icon: TrendingUp, desc: "Find and fix what hurts your rankings", badge: "NEW" },
  { label: "Sentinel Pro", to: "/services/sentinel-pro", icon: Monitor, desc: "Premium monitoring", badge: "NEW" },
  { label: "KodeCare", to: "/services/kodecare", icon: Heart, desc: "Ongoing monthly support retainers" },
];

const learnLinks = [
  { label: "Blog", to: "/learn/blog", icon: FileText, desc: "Articles & tutorials" },
  { label: "Videos", to: "/learn/videos", icon: Video, desc: "Watch & learn" },
  { label: "Agent Skills", to: "/learn/agent-skills", icon: Sparkles, desc: "Expert playbooks the AI uses on demand", badge: "NEW" },
  { label: "Prompt Library", to: "/learn/prompt-library", icon: Library, desc: "Expert prompts by Will Kode", badge: "NEW" },
  { label: "AI LLM Guide", to: "/learn/llm-guide", icon: Settings2, desc: "Pick the right model for the job", badge: "NEW" },
  { label: "SuperAgent", to: "/learn/superagent", icon: Bot, desc: "Base44 AI Agent overview", badge: "B44" },
];

function LearnBadge({ badge }) {
  if (!badge) return null;
  const styles =
    badge === "B44"
      ? "bg-amber-500/90 text-background"
      : "bg-primary text-primary-foreground";
  return (
    <span className={`ml-2 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold leading-none ${styles}`}>
      {badge}
    </span>
  );
}

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

  const getStarted = () => {
    trackCTA({ text: "Get Started", location: "navbar", destination: "/register" });
    navigate("/register");
  };
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
        <Link to="/" className="flex items-center gap-2.5 group">
           <img src="https://media.base44.com/images/public/6a1905a0bc76553d6c934574/7ac1b8038_7feb47fe7_kode-base-logo-white.png" alt="KodeBase" className="h-9 w-auto group-hover:scale-105 transition-transform" />
           <span className="font-sora font-bold text-lg tracking-tight">
             <span className="text-white">KODE</span>
             <span className="text-primary">BASE</span>
           </span>
         </Link>

        <nav className="hidden md:flex items-center gap-1">
          <DropdownMenu>
             <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50 focus:outline-none">
               Learn
               <ChevronDown className="w-4 h-4" />
             </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[34rem] p-3">
              <div className="grid grid-cols-2 gap-1">
                {learnLinks.map((l) => (
                  <DropdownMenuItem key={l.to} asChild className="p-0 focus:bg-transparent">
                    <Link to={l.to} className="flex items-start gap-3 rounded-lg p-3 hover:bg-secondary/60 transition-colors cursor-pointer">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                        <l.icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center font-semibold text-sm text-foreground">
                          {l.label}
                          <LearnBadge badge={l.badge} />
                        </span>
                        <span className="block text-xs text-muted-foreground leading-snug mt-0.5">{l.desc}</span>
                      </span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
             <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50 focus:outline-none">
               Tools
               <ChevronDown className="w-4 h-4" />
             </DropdownMenuTrigger>
             <DropdownMenuContent align="start" className="w-[34rem] p-3">
               <div className="grid grid-cols-2 gap-1">
                 {toolItems.map((item) => (
                   <DropdownMenuItem key={item.to} asChild className="p-0 focus:bg-transparent">
                     <Link to={item.to} className="flex items-start gap-3 rounded-lg p-3 hover:bg-secondary/60 transition-colors cursor-pointer">
                       <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                         <item.icon className="h-4 w-4" />
                       </span>
                       <span className="min-w-0">
                         <span className="flex items-center font-semibold text-sm text-foreground">
                           {item.label}
                           <LearnBadge badge={item.badge} />
                         </span>
                         <span className="block text-xs text-muted-foreground leading-snug mt-0.5">{item.desc}</span>
                       </span>
                     </Link>
                   </DropdownMenuItem>
                 ))}
               </div>
             </DropdownMenuContent>
             </DropdownMenu>
             <DropdownMenu>
             <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50 focus:outline-none">
             Services
             <ChevronDown className="w-4 h-4" />
             </DropdownMenuTrigger>
             <DropdownMenuContent align="start" className="w-[34rem] p-3">
             <div className="grid grid-cols-2 gap-1">
               {serviceItems.map((item) => (
                 <DropdownMenuItem key={item.to} asChild className="p-0 focus:bg-transparent">
                   <Link to={item.to} className="flex items-start gap-3 rounded-lg p-3 hover:bg-secondary/60 transition-colors cursor-pointer">
                     <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                       <item.icon className="h-4 w-4" />
                     </span>
                     <span className="min-w-0">
                       <span className="flex items-center font-semibold text-sm text-foreground">
                         {item.label}
                         <LearnBadge badge={item.badge} />
                       </span>
                       <span className="block text-xs text-muted-foreground leading-snug mt-0.5">{item.desc}</span>
                     </span>
                   </Link>
                 </DropdownMenuItem>
               ))}
             </div>
             </DropdownMenuContent>
             </DropdownMenu>
             <Link to="/products" className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50">
             Products
             </Link>
             {links.map((l) => (
             l.to ? (
               <Link
                 key={l.to}
                 to={l.to}
                 className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
               >
                 {l.label}
               </Link>
             ) : (
               <a
                 key={l.href}
                 href={l.href}
                 className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
               >
                 {l.label}
               </a>
             )
             ))}
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
          <div className="pt-2 pb-1">
             <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">Learn</p>
            {learnLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  <l.icon className="h-4 w-4" />
                </span>
                <span className="flex items-center text-sm font-medium text-muted-foreground">
                  {l.label}
                  <LearnBadge badge={l.badge} />
                </span>
              </Link>
            ))}
            </div>
            <div className="pt-2 pb-1">
             <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">Tools</p>
             {toolItems.map((item) => (
               <Link
                 key={item.to}
                 to={item.to}
                 onClick={() => setOpen(false)}
                 className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
               >
                 <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                   <item.icon className="h-4 w-4" />
                 </span>
                 <span className="flex items-center text-sm font-medium text-muted-foreground">
                   {item.label}
                   <LearnBadge badge={item.badge} />
                 </span>
               </Link>
             ))}
            </div>
            <div className="pt-2 pb-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">Services</p>
            {serviceItems.map((item) => (
             <Link
               key={item.to}
               to={item.to}
               onClick={() => setOpen(false)}
               className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
             >
               <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                 <item.icon className="h-4 w-4" />
               </span>
               <span className="flex items-center text-sm font-medium text-muted-foreground">
                 {item.label}
                 <LearnBadge badge={item.badge} />
               </span>
             </Link>
            ))}
            </div>
            <Link
            to="/products"
            onClick={() => setOpen(false)}
            className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2.5 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
            >
            Products
            </Link>
            {links.map((l) => (
             l.to ? (
               <Link
                 key={l.to}
                 to={l.to}
                 onClick={() => setOpen(false)}
                 className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2.5 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
               >
                 {l.label}
               </Link>
             ) : (
               <a
                 key={l.href}
                 href={l.href}
                 onClick={() => setOpen(false)}
                 className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2.5 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
               >
                 {l.label}
               </a>
             )
            ))}
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