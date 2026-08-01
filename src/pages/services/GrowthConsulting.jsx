import React, { useEffect } from "react";
import Seo from "@/components/seo/Seo";
import { faqSchema } from "@/lib/seo";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, ArrowRight, Check, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ServiceFAQ from "@/components/services/ServiceFAQ";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import { trackEvent } from "@/lib/analytics";
import GrowthHero from "@/components/services/growth/GrowthHero";
import GrowthPillars from "@/components/services/growth/GrowthPillars";
import GrowthPackages from "@/components/services/growth/GrowthPackages";
import GrowthSessionForm from "@/components/services/growth/GrowthSessionForm";
import { IMG, businessQuestions, steps, proofStats, idealFor, faqs } from "@/components/services/growth/growthData";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
};

export default function GrowthConsulting() {
  useEffect(() => {
    trackEvent("page_view", { page: "growth_consulting_service" });
  }, []);

  const handleCTA = (cta) => trackEvent("service_cta_click", { service: "growth_consulting", cta });

  return (
    <>
      <Seo
        title="Base44 Growth Consulting — Turn Your App Into a Profitable SaaS | KodeBase"
        description="You built the app. Now build the business. Positioning, pricing, launch, customer acquisition, conversion and growth strategy for Base44 founders. Growth sessions from $250."
        path="/services/growth-consulting"
        image={IMG.og}
        jsonLd={[faqSchema(faqs)]}
      />

      <GrowthHero onCTA={handleCTA} />

      {/* Problem */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">The real problem</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-4">
              Your app isn't finished when the code is finished.
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Base44 has made it easier than ever to build software. But Base44 can't answer the business questions that come next:
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {businessQuestions.map((q, i) => (
              <motion.div
                key={q}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={(i % 2) * 0.3}
                className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card/60"
              >
                <HelpCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-foreground/90">{q}</span>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-muted-foreground mt-10">
            You can have an incredible application and still build a terrible business.
            <span className="block text-foreground font-semibold mt-2">I help you solve the business side.</span>
          </p>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-20 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">What we work on</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">From Base44 app to profitable SaaS.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              This isn't generic marketing consulting. We look at your actual application, target customer, competition, business model, and current stage of growth — then build a practical strategy for taking your app to market.
            </p>
          </div>
          <GrowthPillars />
        </div>
      </section>

      {/* Roadmap */}
      <section id="process" className="py-20 scroll-mt-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">How it works</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight">Your Base44 Growth Roadmap.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.3}
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

      {/* Positioning + proof */}
      <section className="py-20 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Why me</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-4">Built by a developer. Marketed by a marketer.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Most marketing consultants don't understand software development. Most developers don't understand marketing. I do both — decades across software development, SEO, paid advertising, conversion optimization, analytics, product development, automation, and business growth. That means I can look at your Base44 application from both sides: how the product works, and how the business makes money.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {proofStats.map((s, i) => (
              <motion.div
                key={s.label}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.3}
                className="rounded-2xl border border-border bg-card/60 p-6 text-center"
              >
                <p className="font-sora font-extrabold text-2xl md:text-3xl text-gradient-orange mb-1">{s.value}</p>
                <p className="text-xs text-muted-foreground leading-snug">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who this is for */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Who this is for</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight">This service is ideal if…</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {idealFor.map((item, i) => (
              <motion.div
                key={item}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={(i % 2) * 0.3}
                className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card/60"
              >
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-foreground/90">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="py-20 relative scroll-mt-24">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Packages</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">Pick where you are right now.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Every engagement starts with a review of your actual application — not a template.</p>
          </div>
          <GrowthPackages onCTA={handleCTA} />
        </div>
      </section>

      {/* Booking form */}
      <section id="strategy-session" className="py-20 scroll-mt-24">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Book your session</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">
              Book a Growth Strategy Session — $125
            </h2>
            <p className="text-muted-foreground">
              Tell me about your app, pick the engagement you want, and you'll be taken straight to secure checkout.
            </p>
          </div>
          <GrowthSessionForm />
        </div>
      </section>

      <ReviewsSection seed="service:growth-consulting" title="What founders say about Growth Consulting" />

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
              { tag: "Organic growth", title: "SEO Audit + Fix", desc: "Find and fix what's hurting your rankings — metadata, structure, indexing and performance.", to: "/services/seo-audit" },
              { tag: "Build it for me", title: "Custom App Creation", desc: "A complete custom Base44 app designed and built to your spec.", to: "/services/custom-app-creation" },
              { tag: "1-on-1 help", title: "Kode Sessions", desc: "Live expert sessions where we work through your app together.", to: "/services/kode-sessions" },
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
          <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-4">
            Stop building features.<br /><span className="text-gradient-orange">Start building customers.</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            You've already done something most people never do — you built the application. Now let's turn it into something people discover, use, pay for, and recommend. Whether you're preparing for launch, chasing your first 100 customers, or turning an existing Base44 app into a profitable SaaS business, I'll help you build the strategy to get there.
          </p>
          <a href="#strategy-session" onClick={() => handleCTA("final_cta")}>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-10">
              Grow My Base44 App <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </a>
        </div>
      </section>
    </>
  );
}