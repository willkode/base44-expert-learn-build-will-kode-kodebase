import React, { useEffect } from "react";
import Seo from "@/components/seo/Seo";
import { faqSchema } from "@/lib/seo";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Hammer, ArrowRight, ShieldCheck, Users, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ServiceFAQ from "@/components/services/ServiceFAQ";
import { trackEvent } from "@/lib/analytics";
import { buildIncludes, idealFor, steps, credentials, faqs } from "@/components/services/custom-app/customAppData";
import ReviewsSection from "@/components/reviews/ReviewsSection";

const OG_IMAGE = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/66f6359a9_generated_image.png";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
};

export default function CustomAppCreation() {
  useEffect(() => {
    trackEvent("page_view", { page: "custom_app_creation_service" });
  }, []);

  const handleCTA = (cta) => trackEvent("service_cta_click", { service: "custom_app_creation", cta });

  return (
    <>
      <Seo
        title="Custom App Creation — Custom Base44 Apps Built to Spec from $2,000 | KodeBase"
        description="Get a complete custom Base44 application built to your exact spec by a senior full-stack developer, Base44 platform expert, and Base44 community moderator. Fixed quote, clear timeline. Starting at $2,000."
        path="/services/custom-app-creation"
        image={OG_IMAGE}
        jsonLd={[faqSchema(faqs)]}
      />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-6">
              <Hammer className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Custom App Creation · Starting at $2,000+</span>
            </div>
          </motion.div>
          <motion.h1
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="font-sora font-extrabold text-4xl md:text-6xl tracking-tight mb-4"
          >
            Your app, built to spec.<br />
            <span className="text-gradient-orange">Not built to a template.</span>
          </motion.h1>
          <motion.p
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            A complete custom Base44 application — designed, built, secured, and launched to your exact requirements by a senior full-stack developer, Base44 platform expert, and Base44 community moderator.
          </motion.p>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="flex flex-wrap items-center justify-center gap-6 mb-10">
            {[
              { icon: Code2, label: "Senior full-stack developer" },
              { icon: ShieldCheck, label: "Base44 platform expert" },
              { icon: Users, label: "Base44 community moderator" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="w-4 h-4 text-primary" />
                {label}
              </div>
            ))}
          </motion.div>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4} className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/contact" onClick={() => handleCTA("hero_primary")}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8">
                Get a Custom Quote <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <a href="#process" onClick={() => handleCTA("hero_secondary")}>
              <Button size="lg" variant="outline" className="font-semibold px-8">See How It Works</Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Why custom</p>
          <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-6">
            You already know what you need.<br />You need someone to build it properly.
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed mb-4">
            Half-finished builds, broken permissions, data models that fall apart at scale, features that almost work — that's what happens when an app is assembled by guesswork instead of designed.
          </p>
          <p className="text-muted-foreground text-base leading-relaxed">
            Custom App Creation gives you the opposite: <span className="text-foreground font-semibold">a written spec, a fixed quote, a real architecture, and a finished application you can put in front of real users.</span>
          </p>
        </div>
      </section>

      {/* Who builds it */}
      <section className="py-20 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Who builds it</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight">Built by an expert, not an agency queue.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {credentials.map((c, i) => (
              <motion.div
                key={c.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.4}
                className="rounded-2xl border border-border bg-card/60 overflow-hidden"
              >
                <div className="relative h-40 overflow-hidden">
                  <img src={c.image} alt={c.title} loading="lazy" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="font-sora font-bold text-lg mb-2">{c.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">What's included</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">A complete application, end to end.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Every build is scoped to your spec — here's what a full project typically covers.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {buildIncludes.map((item, i) => (
              <motion.div
                key={item.label}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.25}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card/60"
              >
                <img src={item.image} alt="" loading="lazy" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-2xl mx-auto px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="rounded-2xl border border-primary bg-primary/5 glow-orange p-8 text-center"
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Pricing</p>
            <div className="flex items-baseline justify-center gap-2 mb-3">
              <span className="font-sora font-extrabold text-5xl text-foreground">$2,000+</span>
              <span className="text-sm text-muted-foreground">starting at</span>
            </div>
            <p className="text-muted-foreground mb-6">
              Final pricing depends on features, entities, user roles, integrations, and automation. You get a written spec and a fixed quote before any work begins — no surprise invoices.
            </p>
            <Link to="/contact" onClick={() => handleCTA("pricing_cta")}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8">
                Get a Custom Quote <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Ideal for */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Ideal for</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight">Who this is for.</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {idealFor.map((item, i) => (
              <motion.div
                key={item.label}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.3}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card/60"
              >
                <img src={item.image} alt="" loading="lazy" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="py-20 relative scroll-mt-24">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">How it works</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight">From idea to launched app.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.4}
                className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card/60"
              >
                <img src={step.image} alt="" loading="lazy" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                <div>
                  <span className="font-sora font-extrabold text-lg text-gradient-orange block">{step.num}</span>
                  <p className="font-semibold text-foreground">{step.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ReviewsSection seed="service:custom-app-creation" title="What clients say about Custom App Creation" />

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">FAQ</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight">Frequently Asked Questions</h2>
          </div>
          <ServiceFAQ faqs={faqs} />
        </div>
      </section>

      {/* Related services */}
      <section className="py-20 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Keep exploring</p>
            <h2 className="font-sora font-extrabold text-3xl tracking-tight">Related services</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { tag: "External backend", title: "Base44 BaaS", desc: "Keep building in Base44 while your backend runs on infrastructure you own.", to: "/services/base44-baas" },
              { tag: "Ongoing support", title: "KodeCare", desc: "Monthly support retainers for bug fixes, features, and maintenance.", to: "/services/kodecare" },
              { tag: "Security review", title: "Security Audit + Fix", desc: "Full security review of your app with fixes for what we find.", to: "/services/security-audit" },
            ].map((card) => (
              <motion.div
                key={card.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="rounded-2xl border border-border bg-card/60 p-6 flex flex-col"
              >
                <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">{card.tag}</span>
                <h3 className="font-sora font-bold text-xl mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground flex-1 mb-4">{card.desc}</p>
                <Link to={card.to}>
                  <Button variant="outline" size="sm" className="w-full">Learn more <ArrowRight className="w-3.5 h-3.5 ml-1" /></Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-4">Tell me what you want built.</h2>
          <p className="text-muted-foreground mb-8">Send over your idea or spec and you'll get a written scope, fixed quote, and timeline back — no obligation.</p>
          <Link to="/contact" onClick={() => handleCTA("final_cta")}>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-10">
              Get a Custom Quote <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}