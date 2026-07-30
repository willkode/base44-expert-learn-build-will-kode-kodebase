import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Seo from "@/components/seo/Seo";
import { canonical, SITE } from "@/lib/seo";
import { trackEvent, trackCTA } from "@/lib/analytics";
import ServicesGrid from "@/components/services/ServicesGrid";
import { SERVICES } from "@/components/services/servicesIndexData";

const PATH = "/services";
const OG_IMAGE =
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/00474f5af_generated_image.png";

export default function ServicesIndex() {
  useEffect(() => {
    trackEvent("services_index_view", { page_path: PATH });
  }, []);

  return (
    <div>
      <Seo
        title="Base44 Expert Services — Custom Apps, Repairs, Security, SEO & Migration"
        description="Hire a certified Base44 expert. Custom app builds, emergency repairs, security and SEO audits with fixes, monthly support, external backends and full app migration."
        path={PATH}
        image={OG_IMAGE}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Base44 Expert Services",
            url: canonical(PATH),
            description:
              "Expert Base44 services: custom app creation, emergency repair, security and SEO audits, monthly support, backend-as-a-service and app migration.",
            publisher: { "@type": "Organization", name: SITE.name, url: SITE.domain, logo: SITE.logo },
            mainEntity: {
              "@type": "ItemList",
              itemListElement: SERVICES.map((s, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: s.label,
                url: canonical(s.to),
              })),
            },
          },
        ]}
      />

      <section className="relative overflow-hidden blueprint-grid">
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-14 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold tracking-wide text-primary uppercase">
                Certified Base44 Expert
              </span>
            </div>
            <h1 className="font-sora font-extrabold text-4xl md:text-5xl leading-tight tracking-tight mb-5">
              Done-for-you <span className="text-gradient-orange">Base44 services</span>
            </h1>
            <p className="max-w-2xl mx-auto text-base md:text-lg text-muted-foreground leading-relaxed">
              Whether your app is broken, unsafe, invisible on Google, or still just an idea — pick the
              service that matches where you're stuck and I'll handle it with you.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-red-500 text-primary-foreground font-semibold px-7 py-6"
              >
                <Link
                  to="/contact"
                  onClick={() =>
                    trackCTA({ text: "Talk to Will", location: "services_index_hero", destination: "/contact" })
                  }
                >
                  Talk to Will
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-7 py-6 font-semibold">
                <Link to="/products">Browse products</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <ServicesGrid items={SERVICES} />
      </section>
    </div>
  );
}