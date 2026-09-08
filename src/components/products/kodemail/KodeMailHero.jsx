import React from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Check } from "lucide-react";
import KodeMailBuyButton from "./KodeMailBuyButton";
import { KODEMAIL_PRICE, KODEMAIL_LIST_PRICE, KODEMAIL_HERO_IMAGE } from "./kodeMailData";

export default function KodeMailHero({ owned }) {
  return (
    <div className="text-center mb-16">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold mb-6">
          <Mail className="w-3.5 h-3.5" /> New — KodeMail
        </div>
        <h1 className="font-sora font-bold text-4xl md:text-6xl tracking-tight mb-5">
          Own your business email.<br />
          <span className="text-gradient-orange">Stop paying monthly for it.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Google Workspace and Microsoft 365 charge you every month, per user, forever. KodeMail is your own email
          system — professional addresses like hello@yourbusiness.com on your own domain, for one payment you never
          pay again. No per-seat fees, no renewals, no DNS headaches.
        </p>

        <div className="inline-flex items-end gap-3 mb-8">
          <span className="font-sora font-extrabold text-5xl text-gradient-orange">${KODEMAIL_PRICE}</span>
          <span className="mb-2 text-xl text-muted-foreground line-through">${KODEMAIL_LIST_PRICE}</span>
          <div className="mb-1.5 text-left text-xs text-muted-foreground">one-time · lifetime access</div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {owned ? (
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-primary/30 bg-primary/10 text-primary text-sm font-semibold">
              <Check className="w-4 h-4" /> You own KodeMail — check your dashboard for access
            </div>
          ) : (
            <>
              <KodeMailBuyButton location="kodemail_hero" />
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Secure checkout via Square
              </p>
            </>
          )}
        </div>
      </motion.div>

      <motion.img
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        src={KODEMAIL_HERO_IMAGE}
        alt="KodeMail inbox showing folders and messages for a custom domain email address"
        className="w-full rounded-2xl border border-border mt-12"
      />
    </div>
  );
}