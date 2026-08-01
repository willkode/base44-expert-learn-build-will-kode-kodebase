import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { trackEvent } from "@/lib/analytics";

export default function FinalCTA() {
  const navigate = useNavigate();
  const getStarted = () => navigate("/register");

  return (
    <section className="py-24 relative">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl border border-primary/30 bg-card/80 overflow-hidden p-12 md:p-16 text-center ring-1 ring-white/5"
        >
          <div className="absolute inset-0 blueprint-grid opacity-40" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/15 rounded-full blur-[100px]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="relative">
            <h2 className="font-sora font-extrabold text-3xl md:text-5xl tracking-tight mb-5">
              Don't just prompt your app.
              <br />
              <span className="text-gradient-orange">Build it like an expert.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              AI can build faster than ever — but speed without structure creates chaos. Get the prompts,
              guides, and expert help you need before you start building in Base44. Stop guessing.
              Stop wasting credits. Stop chasing preventable bugs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={getStarted}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base px-10 py-6 glow-orange group transition-transform hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="font-semibold text-base px-8 py-6"
              >
                <Link to="/products" onClick={() => trackEvent("cta_view_products", { location: "home_final_cta" })}>
                  Browse Our Products
                </Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-5">No credit card required · Start in seconds</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}