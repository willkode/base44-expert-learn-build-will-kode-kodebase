import React from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Check, Infinity as InfinityIcon, Cloud, Sparkles } from "lucide-react";
import KodeMailBuyButton from "./KodeMailBuyButton";
import { KODEMAIL_PRICE, KODEMAIL_LIST_PRICE, KODEMAIL_HERO_IMAGE } from "./kodeMailData";

const highlights = [
  { icon: Sparkles, text: "Ordered prompt series" },
  { icon: Cloud, text: "Cloudflare routing guide" },
  { icon: InfinityIcon, text: "Lifetime access" },
];

export default function KodeMailHero({ owned }) {
  return (
    <section className="relative pt-4 sm:pt-8 pb-16 sm:pb-24">
      {/* ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[26rem] w-[52rem] max-w-[130vw] rounded-full bg-primary/15 blur-[120px]"
      />
      <div className="relative grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-10 lg:gap-14 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-[11px] font-semibold tracking-wide">
            <Mail className="w-3.5 h-3.5" /> New — KodeMail
          </div>

          <h1 className="mt-6 font-sora font-bold text-[2.15rem] leading-[1.08] sm:text-5xl lg:text-[3.5rem] tracking-tight">
            Build your own email system.<br />
            <span className="text-gradient-orange">Stop renting your inbox.</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
            KodeMail is a complete series of expertly crafted prompts that build a full inbox system for hosting and
            managing your email — plus step-by-step instructions to configure Cloudflare so your domain's mail routes
            straight into it. Paste the prompts in order, follow the guide, and send from hello@yourbusiness.com.
          </p>

          <ul className="mt-7 flex flex-wrap justify-center lg:justify-start gap-2.5">
            {highlights.map((h) => (
              <li
                key={h.text}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground"
              >
                <h.icon className="w-3.5 h-3.5 text-primary" />
                {h.text}
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-5 sm:p-6 max-w-lg mx-auto lg:mx-0">
            <div className="flex items-end justify-center lg:justify-start gap-3">
              <span className="font-sora font-extrabold text-4xl sm:text-5xl text-gradient-orange">
                ${KODEMAIL_PRICE}
              </span>
              <span className="mb-2 text-lg text-muted-foreground line-through">${KODEMAIL_LIST_PRICE}</span>
              <span className="mb-2 text-xs text-muted-foreground">one-time · lifetime access</span>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row items-center lg:items-start gap-3">
              {owned ? (
                <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-primary/30 bg-primary/10 text-primary text-sm font-semibold">
                  <Check className="w-4 h-4" /> You own KodeMail — check your dashboard for access
                </div>
              ) : (
                <>
                  <KodeMailBuyButton location="kodemail_hero" className="w-full sm:w-auto" />
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 sm:self-center">
                    <Lock className="w-3.5 h-3.5" /> Secure checkout via Square
                  </p>
                </>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-primary/20 via-transparent to-amber-400/10 blur-2xl" aria-hidden="true" />
          <img
            src={KODEMAIL_HERO_IMAGE}
            alt="The inbox system KodeMail's prompts build, showing folders and messages for a custom domain address"
            className="relative w-full rounded-2xl border border-border shadow-2xl shadow-black/40"
          />
        </motion.div>
      </div>
    </section>
  );
}