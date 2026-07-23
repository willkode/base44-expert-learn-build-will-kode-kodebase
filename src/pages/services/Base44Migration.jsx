import React, { useEffect } from "react";
import Seo from "@/components/seo/Seo";
import { faqSchema } from "@/lib/seo";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Rocket, ArrowRight, CheckCircle, KeyRound, ServerCog, Layers, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import ServiceFAQ from "@/components/services/ServiceFAQ";
import { trackEvent } from "@/lib/analytics";
import MigrationIncluded from "@/components/services/migration/MigrationIncluded";
import MigrationStacks from "@/components/services/migration/MigrationStacks";
import MigrationReadiness from "@/components/services/migration/MigrationReadiness";
import { replacedItems, compatFocus, processSteps, deliverables, pricingFactors, faqs } from "@/components/services/migration/migrationData";
import ContactForm from "@/components/contact/ContactForm";
import MigrationSaleBanner from "@/components/migration/MigrationSaleBanner";
import Migration500Special, { isMigrationSpecialActive } from "@/components/services/migration/Migration500Special";

const OG_IMAGE = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/bab7cb2ec_generated_image.png";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
};

export default function Base44Migration() {
  useEffect(() => {
    trackEvent("page_view", { page: "base44_migration_service" });
  }, []);

  const handleCTA = (label) => {
    trackEvent("service_cta_click", { service: "base44_migration", cta: label });
  };

  return (
    <>
      <Seo
        title="Base44 App Migration Services — Take Full Ownership of Your App | KodeBase"
        description="Migrate your Base44 app to infrastructure you control — backend, database, authentication, storage, integrations, and deployment. Keep the frontend, replace the backend. Migrations start at $2,000."
        path="/services/base44-migration"
        image={OG_IMAGE}
        jsonLd={[faqSchema(faqs)]}
      />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="mb-8 text-left"><MigrationSaleBanner /></div>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-6">
              <Rocket className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Base44 App Migration Services</span>
            </div>
          </motion.div>
          <motion.h1
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="font-sora font-extrabold text-4xl md:text-6xl tracking-tight mb-4"
          >
            Take full ownership of your<br />
            <span className="text-gradient-orange">Base44 application.</span>
          </motion.h1>
          <motion.p
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4"
          >
            Your application may have started on Base44, but it does not have to remain dependent on Base44 forever. We migrate Base44 applications to independent infrastructure that you control — backend, database, authentication, storage, integrations, automation, and deployment.
          </motion.p>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={3} className="text-sm font-semibold text-foreground mb-6">
            Base44 migrations start at <span className="text-gradient-orange">$2,000</span>.
          </motion.p>
          {isMigrationSpecialActive() && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3.5} className="mb-8">
              <Migration500Special />
            </motion.div>
          )}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4} className="flex flex-wrap items-center justify-center gap-6 mb-10">
            {[
              { icon: KeyRound, label: "Own your infrastructure" },
              { icon: Layers, label: "Keep your frontend" },
              { icon: ServerCog, label: "Replace the backend" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="w-4 h-4 text-primary" />
                {label}
              </div>
            ))}
          </motion.div>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5} className="flex flex-wrap items-center justify-center gap-3">
            <a href="#contact" onClick={() => handleCTA("hero_contact")}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8">
                Contact Me About Your Migration <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </a>
            <a href="#contact" onClick={() => handleCTA("hero_book_call")}>
              <Button size="lg" variant="outline" className="font-semibold px-8">
                <CalendarDays className="w-4 h-4 mr-1" /> Book a Free Call
              </Button>
            </a>
            <a href="#pricing" onClick={() => handleCTA("hero_secondary")}>
              <Button size="lg" variant="ghost" className="font-semibold px-8">
                See Pricing
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Move beyond platform dependency */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Why migrate</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-6">Move beyond platform dependency.</h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-4 max-w-3xl mx-auto">
              Base44 is an excellent platform for rapidly building and validating an application. As your app grows, however, you may need more control over your infrastructure, operating costs, performance, security, integrations, and deployment process.
            </p>
            <p className="text-muted-foreground text-base leading-relaxed max-w-3xl mx-auto">
              A Base44 migration replaces the services your application currently receives from Base44 with a standalone technology stack <span className="text-foreground font-semibold">owned and controlled by you</span>. Depending on your application, this may include replacing:
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {replacedItems.map(({ img, label }, i) => (
              <motion.div
                key={label}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={(i % 4) * 0.4}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card/60 hover:border-primary/40 transition-colors"
              >
                <img src={img} alt={label} loading="lazy" className="w-full aspect-square object-cover" />
                <div className="p-4 text-center">
                  <p className="font-semibold text-sm text-foreground">{label}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-muted-foreground text-sm mt-8 max-w-2xl mx-auto">
            The goal is not to rebuild your application unnecessarily. The goal is to <span className="text-foreground font-semibold">preserve the working product</span> while replacing the Base44 runtime dependencies behind it.
          </p>
        </div>
      </section>

      {/* Migration Assessment CTA */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/15 via-card to-card p-8 md:p-10 text-center glow-orange">
            <h2 className="font-sora font-extrabold text-2xl md:text-3xl tracking-tight mb-3">
              Not sure what your migration involves?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Run your repository through the free Migration Planner. It scans your codebase, counts every entity, function, and integration, and gives you a readiness score and quote in minutes.
            </p>
            <Link to="/migration-planner" onClick={() => handleCTA("assessment_banner")}>
              <Button size="lg" className="bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] hover:opacity-90 text-white border-0 font-semibold px-8">
                Start Your Free Migration Assessment <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Compatibility layer */}
      <section className="py-20 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Our approach</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-6">
              Keep the frontend.<br /><span className="text-gradient-orange">Replace the backend.</span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-4 max-w-3xl mx-auto">
              Many Base44 applications use a consistent SDK structure for authentication, entities, backend functions, integrations, agents, and realtime subscriptions. Where possible, we create a <span className="text-foreground font-semibold">compatibility layer</span> that preserves the existing frontend interface while redirecting those calls to your new backend.
            </p>
            <p className="text-muted-foreground text-base leading-relaxed max-w-3xl mx-auto">
              This can significantly reduce the number of pages and components that need to be rewritten. Instead of rebuilding every screen, we focus the migration on the systems that currently depend on Base44:
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {compatFocus.map((item, i) => (
              <motion.div
                key={item}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.3}
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/60"
              >
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground">{item}</span>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-muted-foreground text-sm mt-8 max-w-2xl mx-auto">
            Every migration is different, but the objective remains the same: preserve working functionality while removing Base44 as a runtime dependency.
          </p>
        </div>
      </section>

      <MigrationIncluded />

      <MigrationStacks />

      {/* Process */}
      <section className="py-20 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Our migration process</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight">From review to full ownership.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {processSteps.map((step, i) => (
              <motion.div
                key={step.num}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.4}
                className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card/60"
              >
                <span className="font-sora font-extrabold text-2xl text-gradient-orange shrink-0">{step.num}</span>
                <div>
                  <p className="font-semibold text-foreground">{step.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Deliverables */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Migration deliverables</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">What your migration can include.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Deliverables depend on the agreed scope of your migration.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {deliverables.map((item, i) => (
              <motion.div
                key={item}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.2}
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/60"
              >
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Pricing</p>
            {isMigrationSpecialActive() ? (
              <>
                <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">
                  <span className="text-muted-foreground line-through mr-3">$2,000</span>
                  <span className="text-gradient-orange">$500 Migration Special</span>
                </h2>
                <p className="text-sm font-semibold text-primary mb-3">Limited time — offer ends 07/25/2026.</p>
              </>
            ) : (
              <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">
                Starting at <span className="text-gradient-orange">$2,000</span>
              </h2>
            )}
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Migration pricing depends on the size and complexity of the application. A smaller application with limited entities and backend functionality may remain close to the starting price. Applications with complex payments, extensive backend functions, realtime systems, large datasets, AI agents, or multiple integrations will require a custom estimate.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
            {pricingFactors.map((item, i) => (
              <motion.div
                key={item}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.2}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card/60"
              >
                <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-xs font-medium text-foreground">{item}</span>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/migration-planner" onClick={() => handleCTA("pricing_cta")}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8">
                Get Your Migration Plan <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <MigrationReadiness onCTA={handleCTA} />

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
              { tag: "External backend", title: "Base44 BaaS", desc: "Keep building in Base44 while your backend runs on infrastructure you own.", to: "/services/base44-baas", cta: "Learn more" },
              { tag: "Security review", title: "Security Audit + Fix", desc: "Full security review of your app with fixes for what we find.", to: "/services/security-audit", cta: "Learn more" },
              { tag: "Ongoing support", title: "KodeCare", desc: "Monthly support retainers for bug fixes, features, and maintenance.", to: "/services/kodecare", cta: "Learn more" },
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
                  <Button variant="outline" size="sm" className="w-full">{card.cta} <ArrowRight className="w-3.5 h-3.5 ml-1" /></Button>
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
            Take control of your application.
          </h2>
          <p className="text-muted-foreground mb-2">
            Your application should not be permanently limited by the platform where it was originally built. We help Base44 app owners move to infrastructure they control while preserving the functionality, workflows, and customer experience they have already invested in.
          </p>
          <p className="text-sm font-semibold text-foreground mb-8">
            {isMigrationSpecialActive()
              ? <>Limited time: $500 Migration Special — offer ends 07/25/2026.</>
              : <>Base44 migration services start at $2,000.</>}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/migration-planner" onClick={() => handleCTA("final_cta")}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-10">
                Start Your Migration Assessment <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <a href="#contact" onClick={() => handleCTA("final_book_call")}>
              <Button size="lg" variant="outline" className="font-semibold px-8">
                <CalendarDays className="w-4 h-4 mr-1" /> Book a Free Call
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Contact form */}
      <section id="contact" className="py-20 relative scroll-mt-24">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Contact</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">Tell me about your migration.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Share a few details about your app first — once your message is sent, you'll get a link to book your free call.</p>
          </div>
          <ContactForm bookingUrl="https://calendar.app.google/HkWivU8RSamGuGUcA" />
        </div>
      </section>
    </>
  );
}