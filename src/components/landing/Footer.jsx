import React from "react";
import { Link } from "react-router-dom";
import { Hammer } from "lucide-react";
import SocialLinks from "@/components/landing/SocialLinks";

export default function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Hammer className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-sora font-bold">KodeBase</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href="#how" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#agents" className="hover:text-foreground transition-colors">Agents</a>
            <a href="#blueprint" className="hover:text-foreground transition-colors">Blueprint</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <Link to="/coffee" className="hover:text-foreground transition-colors">Buy Me a Coffee</Link>
          </nav>
          <SocialLinks />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} KodeBase
          </p>
        </div>
      </div>
    </footer>
  );
}