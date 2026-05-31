import React from "react";
import { motion } from "framer-motion";
import { Boxes, Database, ShieldCheck, Palette, Server, ClipboardCheck, Wand2 } from "lucide-react";

const agents = [
  { icon: Boxes, name: "Product Architect", desc: "Defines your app structure, user types, features, workflows, and build scope.", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/c736c7f7e_generated_image.png" },
  { icon: Database, name: "Database Architect", desc: "Maps your Base44 entities, fields, and relationships so your app doesn't become a mess later.", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/63726a958_generated_image.png" },
  { icon: ShieldCheck, name: "Security Architect", desc: "Plans roles, ownership rules, and access control before you accidentally expose user data.", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/3e32d58c4_generated_image.png" },
  { icon: Palette, name: "UI Architect", desc: "Creates your page map, dashboards, user flows, and admin areas.", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/a09f1fba4_generated_image.png" },
  { icon: Server, name: "Backend Architect", desc: "Plans functions, automations, integrations, notifications, and API logic.", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/ed77fa406_generated_image.png" },
  { icon: ClipboardCheck, name: "QA Agent", desc: "Creates test cases, launch checks, and bug prevention steps before your users find the problems.", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/534fd1d1e_generated_image.png" },
  { icon: Wand2, name: "Prompt Engineer", desc: "Turns the full plan into structured, sequenced Base44 prompts you paste directly into your build.", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/fd9015348_generated_image.png" },
];

export default function Agents() {
  return (
    <section id="agents" className="py-24 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-widest">The AI Architecture Team</span>
          <h2 className="font-sora font-bold text-3xl md:text-5xl tracking-tight mt-4 mb-5">
            One prompt cannot architect a full app. <span className="text-gradient-orange">A team can.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Kode Architect uses specialized AI agents that each focus on one critical part of your app — working together on one cohesive Base44 build plan.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {agents.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              className="group relative rounded-2xl border border-border bg-card/70 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className="relative h-36 overflow-hidden">
                <img
                  src={a.image}
                  alt={a.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
              </div>
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-7 pt-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-105 transition-all duration-300">
                  <a.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="font-sora font-bold text-lg mb-2">{a.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{a.desc}</p>
              </div>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="relative rounded-2xl border border-primary/30 bg-primary/5 p-7 flex flex-col justify-center overflow-hidden glow-orange"
          >
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
            <h3 className="relative font-sora font-bold text-lg mb-2 text-gradient-orange">7 Architects. One Blueprint.</h3>
            <p className="relative text-sm text-muted-foreground leading-relaxed">
              Every expert feeds one cohesive plan that's ready to build.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}