import React, { useEffect } from "react";
import Seo from "@/components/seo/Seo";
import { faqSchema } from "@/lib/seo";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Database, ArrowRight, CheckCircle, Shield, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import ServiceFAQ from "@/components/services/ServiceFAQ";
import { trackEvent } from "@/lib/analytics";
import ReviewsSection from "@/components/reviews/ReviewsSection";

const OG_IMAGE = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/004d61f83_generated_image.png";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
};

const capabilities = [
  { img: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/0f0fa08f4_generated_image.png", label: "External Database", desc: "PostgreSQL or Supabase database you own" },
  { img: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/18d46716d_generated_image.png", label: "API & Serverless Layer", desc: "Secure endpoints and Cloudflare Workers" },
  { img: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/c182e5b29_generated_image.png", label: "Auth & User Management", desc: "Third-party auth providers, sessions, roles" },
  { img: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/a2d17505e_generated_image.png", label: "RBAC & Row-Level Security", desc: "Fine-grained access control policies" },
  { img: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/48e354c1c_generated_image.png", label: "File & Image Storage", desc: "Amazon S3 or Cloudflare R2 storage" },
  { img: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/c014d8203_generated_image.png", label: "Email, SMS & Notifications", desc: "Transactional messaging systems" },
  { img: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/dcf1bd36a_generated_image.png", label: "Jobs & Background Processing", desc: "Scheduled tasks and async queues" },
  { img: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/b1b1ec510_generated_image.png", label: "Webhook Processing", desc: "Reliable inbound & outbound webhooks" },
  { img: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/9073105c4_generated_image.png", label: "Payments & Subscriptions", desc: "Billing infrastructure that scales" },
  { img: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/58be709e2_generated_image.png", label: "Audit Logs & Tracking", desc: "Activity trails and compliance logging" },
  { img: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/313361e63_generated_image.png", label: "Third-Party Integrations", desc: "Any external API, wired in properly" },
  { img: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/a2d94e4f9_generated_image.png", label: "Monitoring & Error Reporting", desc: "Logging, alerts, and observability" },
  { img: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/e8ea3b23f_generated_image.png", label: "Backups & Recovery", desc: "Automated backups and restore processes" },
  { img: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/4f695316d_generated_image.png", label: "Staging & Production", desc: "Separate environments, safe deploys" },
];

const idealFor = [
  "Apps that outgrew basic Base44 backend functionality",
  "Teams that need more control over data and permissions",
  "Apps handling large amounts of data",
  "Complex integrations or heavy automation",
  "Backends that must also serve web and mobile apps",
  "Builders who want to reduce platform lock-in",
  "Apps planning a future migration away from Base44",
  "Stronger security, logging, or compliance needs",
];

const deliverables = [
  "Backend architecture plan",
  "Database schema and relationships",
  "Secure API endpoints",
  "Authentication and permissions",
  "Base44 integration",
  "Environment configuration",
  "Data migration",
  "Testing and validation",
  "Technical documentation",
  "Deployment and handoff",
  "Optional ongoing backend management",
];

const packages = [
  {
    title: "BaaS Foundation",
    price: "$500",
    priceNote: "starting at",
    subtitle: "The core backend layer",
    badge: null,
    features: [
      "External PostgreSQL / Supabase database",
      "Authentication and user management",
      "File and image storage",
      "Basic API integration with Base44",
      "Environment configuration",
      "Technical documentation & handoff",
    ],
  },
  {
    title: "BaaS Growth",
    price: "$2,000",
    priceNote: "starting at",
    subtitle: "Production-ready infrastructure",
    badge: "Most Popular",
    features: [
      "Everything in Foundation",
      "Role-based access & row-level security",
      "Third-party integrations",
      "Automations and background jobs",
      "Payment and subscription infrastructure",
      "Production deployment",
    ],
  },
  {
    title: "BaaS Enterprise",
    price: "$5,000+",
    priceNote: "starting at",
    subtitle: "Complex, high-volume systems",
    badge: null,
    features: [
      "Everything in Growth",
      "Complex workflows and processing",
      "Multiple environments (staging + prod)",
      "High-volume data architecture",
      "Compliance and audit controls",
      "Custom infrastructure requirements",
    ],
  },
];

const managedPlan = {
  title: "Managed Backend",
  price: "$500–$2,500/mo",
  subtitle: "Ongoing backend management after your build",
  features: [
    "Monitoring and error reporting",
    "Maintenance and updates",
    "Automated backups and recovery",
    "Ongoing backend development",
  ],
};

const steps = [
  { num: "01", title: "Discovery call", desc: "We review your app, data, integrations, and goals to scope the right package." },
  { num: "02", title: "Architecture plan", desc: "You get a backend architecture plan with schema, security, and integration design." },
  { num: "03", title: "Build & integrate", desc: "We build the backend and connect it to your existing Base44 frontend." },
  { num: "04", title: "Migrate & validate", desc: "Data migration, testing, and validation across environments." },
  { num: "05", title: "Deploy & handoff", desc: "Production deployment, documentation, and full handoff of everything you own." },
  { num: "06", title: "Manage (optional)", desc: "Optional monthly management: monitoring, backups, updates, and ongoing dev." },
];

const faqs = [
  { q: "What is Base44 BaaS?", a: "Base44 BaaS is a managed backend development service for businesses that want to keep using Base44 without relying entirely on its built-in backend. We connect your Base44 app to a professionally structured external backend using Supabase, PostgreSQL, Cloudflare Workers, Node.js, Amazon S3, Cloudflare R2, and third-party authentication providers." },
  { q: "Do I have to rebuild my app?", a: "No. Base44 BaaS does not require rebuilding your application. Your existing Base44 frontend stays in place while critical backend functionality is moved into a standalone infrastructure layer." },
  { q: "Why move backend functionality out of Base44?", a: "Greater control, portability, performance, security, and scalability. You own your data and infrastructure, can support future web and mobile apps from the same backend, and reduce platform lock-in — while your team keeps building the UI inside Base44." },
  { q: "What technologies do you use?", a: "Supabase, PostgreSQL, Cloudflare Workers, Node.js, Amazon S3, Cloudflare R2, and third-party authentication providers — chosen based on your app's needs." },
  { q: "How is pricing determined?", a: "Packages start at $500. Exact pricing depends on your entities, integrations, roles, data volume, automations, and security requirements. Every project starts with a discovery call to scope it accurately." },
  { q: "Can you migrate my existing Base44 data?", a: "Yes. Data migration is a standard deliverable — we move your entities into the external database with testing and validation so nothing is lost." },
  { q: "What if I plan to leave Base44 eventually?", a: "Base44 BaaS is ideal for that. Because your data, auth, and business logic live in infrastructure you own, a future migration away from Base44 only requires rebuilding the frontend — the backend comes with you." },
  { q: "Do you offer ongoing support after the build?", a: "Yes. The Managed Backend plan ($500–$2,500/month) covers monitoring, maintenance, backups, updates, and ongoing backend development." },
];

export default function Base44Baas() {
  useEffect(() => {
    trackEvent("page_view", { page: "base44_baas_service" });
  }, []);

  const handleCTA = (label) => {
    trackEvent("service_cta_click", { service: "base44_baas", cta: label });
  };

  return (
    <>
      <Seo
        title="Base44 BaaS — Scalable External Backend for Your Base44 App | KodeBase"
        description="Keep your Base44 frontend, upgrade your backend. Professional external backend builds with Supabase, PostgreSQL, Cloudflare Workers, S3, and more. Control, security, and scalability — from $500."
        path="/services/base44-baas"
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
              <Database className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Managed Backend Development · Base44 BaaS</span>
            </div>
          </motion.div>
          <motion.h1
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="font-sora font-extrabold text-4xl md:text-6xl tracking-tight mb-4"
          >
            Keep your Base44 frontend.<br />
            <span className="text-gradient-orange">Upgrade your backend.</span>
          </motion.h1>
          <motion.p
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Base44 BaaS connects your app to a professionally structured external backend — Supabase, PostgreSQL, Cloudflare Workers, S3, and more — for greater control, performance, security, and scalability.
          </motion.p>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="flex flex-wrap items-center justify-center gap-6 mb-10">
            {[
              { icon: Database, label: "Own your data" },
              { icon: Shield, label: "Stronger security" },
              { icon: Layers, label: "No full rebuild" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="w-4 h-4 text-primary" />
                {label}
              </div>
            ))}
          </motion.div>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4} className="flex flex-wrap items-center justify-center gap-3">
            <a href="#pricing" onClick={() => handleCTA("hero_primary")}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8">
                View Packages <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </a>
            <Link to="/contact" onClick={() => handleCTA("hero_secondary")}>
              <Button size="lg" variant="outline" className="font-semibold px-8">
                Book a Discovery Call
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* The problem */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Why Base44 BaaS</p>
          <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-6">
            Your app grew.<br />Its backend should too.
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed mb-4">
            Base44 is fantastic for building fast. But as your app handles more data, more users, more integrations, and stricter security requirements, the built-in backend can become the constraint.
          </p>
          <p className="text-muted-foreground text-base leading-relaxed">
            Base44 BaaS moves your critical backend functionality into infrastructure you own — <span className="text-foreground font-semibold">without rebuilding your app. Your team keeps building the UI in Base44 while the backend scales independently.</span>
          </p>
        </div>
      </section>

      {/* What we build */}
      <section className="py-20 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">What we can build</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">A complete backend layer.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Everything your app needs behind the scenes — built with Supabase, PostgreSQL, Cloudflare Workers, Node.js, S3, and R2.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {capabilities.map(({ img, label, desc }, i) => (
              <motion.div
                key={label}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={(i % 4) * 0.4}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card/60 hover:border-primary/40 transition-colors"
              >
                <img src={img} alt={label} loading="lazy" className="w-full aspect-square object-cover" />
                <div className="p-4 text-center">
                  <p className="font-semibold text-sm text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ideal for */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Ideal for</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight">Built for apps that hit the ceiling.</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {idealFor.map((item, i) => (
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
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Packages</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">Recommended packages.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Exact pricing depends on entities, integrations, roles, data volume, automations, and security requirements. Every project starts with a discovery call.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <motion.div
                key={pkg.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className={`relative rounded-2xl border p-8 flex flex-col ${pkg.badge ? "border-primary bg-primary/5 glow-orange" : "border-border bg-card/60"}`}
              >
                {pkg.badge && (
                  <div className="absolute -top-3 left-6">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">{pkg.badge}</span>
                  </div>
                )}
                <h3 className="font-sora font-bold text-xl mb-1">{pkg.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{pkg.subtitle}</p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="font-sora font-extrabold text-4xl text-foreground">{pkg.price}</span>
                  <span className="text-xs text-muted-foreground">{pkg.priceNote}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/contact" onClick={() => handleCTA(pkg.title)}>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                    Get a Quote <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Managed backend */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="mt-6 rounded-2xl border border-border bg-card/60 p-8 md:flex items-center gap-8"
          >
            <div className="flex-1 mb-6 md:mb-0">
              <h3 className="font-sora font-bold text-xl mb-1">{managedPlan.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{managedPlan.subtitle}</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {managedPlan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center md:text-right shrink-0">
              <p className="font-sora font-extrabold text-3xl text-foreground mb-3">{managedPlan.price}</p>
              <Link to="/contact" onClick={() => handleCTA("managed_backend")}>
                <Button variant="outline" className="font-semibold">Discuss Managed Backend</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Deliverables */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Deliverables</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight">What every project can include.</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {deliverables.map((item, i) => (
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
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">How it works</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight">From discovery to handoff.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {steps.map((step, i) => (
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

      <ReviewsSection seed="service:base44-baas" title="What clients say about Base44 BaaS" />

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
              { tag: "Ongoing support", title: "KodeCare", desc: "Monthly support retainers for bug fixes, features, and maintenance.", to: "/services/kodecare", cta: "Learn more" },
              { tag: "Security review", title: "Security Audit + Fix", desc: "Full security review of your app with fixes for what we find.", to: "/services/security-audit", cta: "Learn more" },
              { tag: "1-on-1 guidance", title: "Kode Sessions", desc: "Book a 1-2 hour expert session for specific questions or guidance.", to: "/services/kode-sessions", cta: "Learn more" },
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
            Ready for a backend you own?
          </h2>
          <p className="text-muted-foreground mb-8">Book a free discovery call. We'll review your app and recommend the right package — no full rebuild required.</p>
          <Link to="/contact" onClick={() => handleCTA("final_cta")}>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-10">
              Book a Discovery Call <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}