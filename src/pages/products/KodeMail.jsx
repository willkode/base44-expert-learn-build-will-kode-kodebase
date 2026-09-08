import React, { useState, useEffect } from "react";
import Seo from "@/components/seo/Seo";
import { faqSchema } from "@/lib/seo";
import { base44 } from "@/api/base44Client";
import { trackEvent } from "@/lib/analytics";
import ServiceFAQ from "@/components/services/ServiceFAQ";
import KodeMailHero from "@/components/products/kodemail/KodeMailHero";
import KodeMailFeatures from "@/components/products/kodemail/KodeMailFeatures";
import KodeMailSetup from "@/components/products/kodemail/KodeMailSetup";
import KodeMailSecurity from "@/components/products/kodemail/KodeMailSecurity";
import KodeMailBuyButton from "@/components/products/kodemail/KodeMailBuyButton";
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
    <div className="min-h-screen bg-background pb-24 px-6 pt-16">
      <Seo
        title="KodeMail — Business Email On Your Own Domain, No DNS Setup | KodeBase"
        description="Professional email like hello@yourbusiness.com in minutes. Connect Cloudflare, pick your address, and get a modern inbox — no DNS records, no mail-server settings. One-time $25, lifetime access."
        path="/products/kodemail"
        type="product"
        image={KODEMAIL_OG_IMAGE}
        jsonLd={[faqSchema(faqs)]}
      />

      <div className="max-w-6xl mx-auto">
        <KodeMailHero owned={owned} />
        <KodeMailFeatures />
        <KodeMailSetup />
        <KodeMailSecurity />

        <section className="mb-16">
          <h2 className="font-sora font-bold text-3xl text-center mb-8">Frequently asked questions</h2>
          <div className="max-w-3xl mx-auto">
            <ServiceFAQ faqs={faqs} />
          </div>
        </section>

        {!owned && (
          <div className="text-center rounded-2xl border border-primary/20 bg-primary/5 p-10">
            <h2 className="font-sora font-bold text-2xl mb-2">Connect your domain. Create your address. Open your inbox.</h2>
            <p className="text-muted-foreground text-sm mb-6">
              ${KODEMAIL_PRICE} once — lifetime access, no subscription.
            </p>
            <KodeMailBuyButton location="kodemail_final_cta" label={`Get KodeMail — $${KODEMAIL_PRICE}`} />
          </div>
        )}
      </div>
    </div>
  );
}