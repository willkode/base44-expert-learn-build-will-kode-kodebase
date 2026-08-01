import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { packages } from "@/components/services/growth/growthData";

export default function GrowthPackages({ onCTA }) {
  return (
    <div className="grid md:grid-cols-3 gap-6 items-start">
      {packages.map((pkg, i) => (
        <motion.div
          key={pkg.name}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.08 }}
          className={`relative rounded-2xl border p-6 flex flex-col h-full ${
            pkg.popular ? "border-primary bg-primary/5 glow-orange" : "border-border bg-card/60"
          }`}
        >
          {pkg.popular && (
            <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
              Most popular
            </span>
          )}
          <h3 className="font-sora font-bold text-xl mb-1">{pkg.name}</h3>
          <p className="font-sora font-extrabold text-3xl text-gradient-orange mb-2">{pkg.price}</p>
          <p className="text-sm text-muted-foreground mb-5">{pkg.tagline}</p>
          <div className="space-y-2 mb-6">
            {pkg.features.map((f) => (
              <div key={f} className="flex items-start gap-2 text-sm text-foreground/90">
                <Check className="w-3.5 h-3.5 text-primary mt-1 shrink-0" />
                {f}
              </div>
            ))}
          </div>
          <Link to="/contact" className="mt-auto" onClick={() => onCTA?.(`package_${pkg.name}`)}>
            <Button
              className={`w-full font-semibold ${pkg.popular ? "bg-primary hover:bg-primary/90 text-primary-foreground" : ""}`}
              variant={pkg.popular ? "default" : "outline"}
            >
              Get Started <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}