import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { trackCTA } from "@/lib/analytics";

const SERVICES = [
  {
    tag: "Build",
    title: "Custom App Creation",
    desc: "A complete custom Base44 app designed, built, secured, and launched to your exact spec.",
    to: "/services/custom-app-creation",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/60c81e3cd_generated_image.png",
  },
  {
    tag: "Migration",
    title: "Base44 Migration",
    desc: "Move your app off Base44's backend onto infrastructure you own — without rebuilding the frontend.",
    to: "/services/base44-migration",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/c83156967_generated_image.png",
  },
  {
    tag: "External backend",
    title: "Base44 BaaS",
    desc: "Keep building in Base44 while your data and backend run on infrastructure you control.",
    to: "/services/base44-baas",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/1962dce20_generated_image.png",
  },
  {
    tag: "Emergency",
    title: "ER Service",
    desc: "Urgent help when your app is broken, blocked, or bleeding credits — fast turnaround.",
    to: "/services/er-service",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/8f10c4244_generated_image.png",
  },
  {
    tag: "Security",
    title: "Security Audit + Fix",
    desc: "Full security review of your app — permissions, data exposure, and backend risks, with fixes.",
    to: "/services/security-audit",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/0fc380c70_generated_image.png",
  },
  {
    tag: "SEO",
    title: "SEO Audit",
    desc: "Technical and on-page SEO review so your app actually gets found in search.",
    to: "/services/seo-audit",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/1245e09c2_generated_image.png",
  },
  {
    tag: "Coaching",
    title: "Kode Sessions",
    desc: "Live 1-on-1 sessions to unblock your build, review your plan, and level up fast.",
    to: "/services/kode-sessions",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/b9e1e04de_generated_image.png",
  },
  {
    tag: "Ongoing support",
    title: "KodeCare",
    desc: "Monthly retainers for bug fixes, new features, and ongoing maintenance of your app.",
    to: "/services/kodecare",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/cfafca3ff_generated_image.png",
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="relative py-24 scroll-mt-20 overflow-hidden">
      <div className="absolute inset-0 blueprint-grid opacity-20" />
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-widest">Services</span>
          <h2 className="font-sora font-bold text-3xl md:text-5xl tracking-tight mt-4 mb-5">
            Done-for-you <span className="text-gradient-orange">expert services</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From building your app to migrating, securing, and maintaining it — pick the help you need.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.to}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.08 }}
            >
              <Link
                to={s.to}
                onClick={() => trackCTA({ text: s.title, location: "home_services", destination: s.to })}
                className="group flex flex-col h-full overflow-hidden rounded-2xl border border-border bg-card/70 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={s.image}
                    alt={s.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                </div>
                <div className="flex flex-col flex-1 p-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">{s.tag}</span>
                  <h3 className="font-sora font-bold text-lg mb-2 group-hover:text-primary transition-colors">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{s.desc}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all">
                    Learn more <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}