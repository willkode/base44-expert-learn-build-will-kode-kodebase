import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const DiscordIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.6 12.6 0 0 0-.617-1.249.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.056c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028ZM8.02 15.331c-1.182 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.332-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.332-.946 2.418-2.157 2.418Z" />
  </svg>
);

export default function DashboardHero({ title, description }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl border border-border bg-card/60 blueprint-grid"
    >
      <div className="absolute -top-24 -left-16 h-64 w-64 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 right-0 h-64 w-64 rounded-full bg-[#facc15]/10 blur-3xl pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#fb923c]/60 to-transparent" />

      <div className="relative flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center md:justify-between md:gap-10">
        <div className="min-w-0">
          <h1 className="font-sora font-bold text-2xl sm:text-3xl md:text-4xl tracking-tight">
            {title}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">{description}</p>
        </div>

        <Button
          asChild
          size="lg"
          className="w-full md:w-auto shrink-0 rounded-full bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-white font-semibold border-0 shadow-lg shadow-primary/20 transition-all hover:opacity-90 hover:-translate-y-0.5"
        >
          <a href="https://discord.com/invite/cwEv93EwBA" target="_blank" rel="noopener noreferrer">
            <DiscordIcon className="w-4 h-4 mr-1" />
            Join our Discord
          </a>
        </Button>
      </div>
    </motion.section>
  );
}