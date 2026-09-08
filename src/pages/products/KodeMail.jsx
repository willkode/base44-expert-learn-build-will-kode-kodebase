import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import Seo from "@/components/seo/Seo";
import { faqSchema } from "@/lib/seo";
import { base44 } from "@/api/base44Client";
import { trackEvent } from "@/lib/analytics";
import ServiceFAQ from "@/components/services/ServiceFAQ";
import KodeMailHero from "@/components/products/kodemail/KodeMailHero";
import KodeMailOwnership from "@/components/products/kodemail/KodeMailOwnership";
import KodeMailFeatures from "@/components/products/kodemail/KodeMailFeatures";
import KodeMailSetup from "@/components/products/kodemail/KodeMailSetup";
import KodeMailSecurity from "@/components/products/kodemail/KodeMailSecurity";
import KodeMailBuyButton from "@/components/products/kodemail/KodeMailBuyButton";
import KodeMailSectionHeading from "@/components/products/kodemail/KodeMailSectionHeading";
import KodeMailStickyBar from "@/components/products/kodemail/KodeMailStickyBar";
import { faqs, KODEMAIL_PRODUCT_ID, KODEMAIL_PRICE, KODEMAIL_OG_IMAGE } from "@/components/products/kodemail/kodeMailData";

export default function KodeMail() {
  const [owned, setOwned] = useState(false);

  useEffect(() => {
    trackEvent("kodemail_page_view", { source: "landing" });
    base44.functions
      .invoke("getMyProducts", {})
      .then((res) => {
        const products = res.data?.products || [];
        setOwned(products.some((p) => p.id === KODEMAIL_PRODUCT_ID || p.slug === "kodemail"));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <Seo
        title="KodeMail — Own Your Business Email, Stop Paying Monthly | KodeBase"
        description="Stop renting your inbox. KodeMail's ordered prompt pack builds a full email system on your own domain, with exact Cloudflare setup steps. Unlimited addresses, one payment, no monthly per-user fees."
        path="/products/kodemail"
        type="product"
        image={KODEMAIL_OG_IMAGE}
        jsonLd={[faqSchema(faqs)]}
      />

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 blueprint-grid opacity-[0.55]" />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-6 pt-16 pb-28 lg:pb-24 divide-y divide-border/60">
        <KodeMailHero owned={owned} />
        <KodeMailOwnership />
        <KodeMailFeatures />
        <KodeMailSetup />
        <KodeMailSecurity />

        <section className="py-16 sm:py-24">
          <KodeMailSectionHeading eyebrow="Before you buy" title="Straight answers to the questions people ask" />
          <div className="max-w-3xl mx-auto">
            <ServiceFAQ faqs={faqs} />
          </div>
        </section>

        {!owned && (
          <section className="py-16 sm:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55 }}
              className="relative overflow-hidden text-center rounded-3xl border border-primary/25 bg-gradient-to-b from-primary/12 to-primary/[0.03] px-6 py-12 sm:px-12 sm:py-16"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-[34rem] max-w-[120vw] rounded-full bg-primary/20 blur-[90px]"
              />
              <h2 className="relative font-sora font-bold text-2xl sm:text-[2rem] leading-tight tracking-tight mb-3">
                Pay once today, or keep paying every month forever.
              </h2>
              <p className="relative text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-8">
                ${KODEMAIL_PRICE} gets you the full prompt series and the Cloudflare setup guide, for life. That's less
                than one month of a mailbox you'd never own.
              </p>
              <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3">
                <KodeMailBuyButton
                  location="kodemail_final_cta"
                  label={`Own my email — $${KODEMAIL_PRICE}`}
                  className="w-full sm:w-auto"
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Secure checkout via Square
                </p>
              </div>
            </motion.div>
          </section>
        )}
      </div>

      {!owned && <KodeMailStickyBar />}
    </div>
  );
}