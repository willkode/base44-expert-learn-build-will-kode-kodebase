import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { MIGRATION_START_PRICE } from "@/components/services/migration/MigrationQuoteTool";

export default function MigrationLastChance() {
  return (
    <section className="relative px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto rounded-2xl border border-primary/40 bg-card/80 glow-orange overflow-hidden">
        
        <div className="h-1 bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15]" />
        <div className="flex flex-col md:flex-row items-center gap-5 md:gap-8 p-6 md:p-8">
          <div className="flex items-center gap-4 flex-1 text-center md:text-left flex-col md:flex-row">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
              <Rocket className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gradient-orange mb-1">
                Base44 App Migration
              </p>
              <h2 className="font-sora font-bold text-xl md:text-2xl mb-1">
                Migrations start at{" "}
                <span className="text-gradient-orange">${MIGRATION_START_PRICE}</span>{" "}
                <span className="text-muted-foreground text-base font-normal line-through">$2,000</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                We rebuilt our Base44 backend and automated the migration pipeline. Apps under 100 pages
                and backend functions migrate for a flat ${MIGRATION_START_PRICE} — quoted instantly.
              </p>
            </div>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] hover:opacity-90 text-white font-semibold border-0 shrink-0"
            onClick={() =>
            trackEvent("migration_banner_click", {
              location: "home_below_hero",
              price: MIGRATION_START_PRICE
            })
            }>
            
            <Link to="/services/base44-migration">
              Get My Migration Quote <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </section>);

}