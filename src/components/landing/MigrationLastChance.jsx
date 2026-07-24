import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlarmClock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

// 24hr last-chance deadline (ends 07/25/2026 12:00 PM CT)
const DEADLINE = new Date("2026-07-25T12:00:00-05:00");

function getTimeLeft() {
  const diff = DEADLINE - new Date();
  if (diff <= 0) return null;
  return {
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

const pad = (n) => String(n).padStart(2, "0");

export default function MigrationLastChance() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!timeLeft) return null;

  return (
    <section className="relative px-6 pt-4 pb-2">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto rounded-2xl border border-primary/40 bg-card/80 glow-orange overflow-hidden"
      >
        <div className="h-1 bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15]" />
        <div className="flex flex-col md:flex-row items-center gap-5 md:gap-8 p-6 md:p-8">
          <div className="flex items-center gap-4 flex-1 text-center md:text-left flex-col md:flex-row">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
              <AlarmClock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gradient-orange mb-1">
                24-Hour Notice — Last Chance
              </p>
              <h2 className="font-sora font-bold text-xl md:text-2xl mb-1">
                Base44 Migration for <span className="text-gradient-orange">$500</span>{" "}
                <span className="text-muted-foreground text-base font-normal line-through">$2,000</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                The $500 flat-rate migration special ends in{" "}
                <span className="font-semibold text-foreground tabular-nums">
                  {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
                </span>
                . After that, migrations return to $2,000.
              </p>
            </div>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] hover:opacity-90 text-white font-semibold border-0 shrink-0"
            onClick={() =>
              trackEvent("migration_last_chance_click", { location: "home_below_hero", price: 500 })
            }
          >
            <Link to="/services/base44-migration">
              Claim $500 Migration <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}