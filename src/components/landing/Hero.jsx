import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NEBULA_BG = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/412194915_d32a9ead9_Gemini_Generated_Image_cy4o04cy4o04cy4o.png";
const WILL_PHOTO = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/a75f49248_b2ff656b5_will-kode-hero-profile.png";

export default function Hero() {
  const navigate = useNavigate();
  const getStarted = () => navigate("/register");

  return (
    <section className="relative overflow-hidden h-[90vh] flex items-center">
      {/* Nebula background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${NEBULA_BG})` }} />
      
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

      <div className="relative w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-8 items-center pt-32 pb-16 lg:pt-24">
        {/* Left — copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-7 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold tracking-wide text-primary uppercase">CERTIFIED BASE44 EXPERT · Base44 MOD + Ambassador

            </span>
          </div>

          <h1 className="font-sora font-extrabold text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight mb-6">
            Become a
            <br />
            <span className="text-gradient-orange">Base44 Expert</span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-9">
            I'm Will Kode — full-stack since 1997, 20+ years building production apps, 15+ years in
            marketing, and a certified Base44 Expert. I architect, audit, secure, and ship AI-first
            Apps — the kind that survives real users.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-10">
            <Button
              onClick={getStarted}
              size="lg"
              className="bg-primary hover:bg-red-500 text-primary-foreground font-semibold text-base px-7 py-6 shadow-lg shadow-red-600/30 group transition-transform hover:-translate-y-0.5">
              
              Hire Me to Build It
              <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={() => document.querySelector("#how")?.scrollIntoView({ behavior: "smooth" })}
              size="lg"
              variant="outline"
              className="bg-white/5 hover:bg-white/10 text-white border border-white/15 font-semibold text-base px-7 py-6">
              
              <Play className="w-4 h-4 mr-1" />
              My App is Broken — Help
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Full-stack since 1997
            </span>
            <span className="hidden sm:block w-px h-4 bg-border" />
            <span>Certified Base44 Expert</span>
            <span className="hidden sm:block w-px h-4 bg-border" />
            <span>500+ apps shipped</span>
          </div>
        </motion.div>

        {/* Right — photo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden lg:block self-end -mr-6 -mb-16">
          
          <img
            src={WILL_PHOTO}
            alt="Will Kode — Certified Base44 Expert"
            className="relative z-10 w-full max-w-[720px] ml-auto drop-shadow-2xl" />
          
        </motion.div>
      </div>
    </section>);

}