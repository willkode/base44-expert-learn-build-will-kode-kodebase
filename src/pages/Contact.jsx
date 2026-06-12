import React from "react";
import { motion } from "framer-motion";
import ContactForm from "@/components/contact/ContactForm";
import SocialLinks from "@/components/landing/SocialLinks";
import { Mail } from "lucide-react";

export default function Contact() {
  return (
    <section className="py-24 relative">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-widest">Contact</span>
          <h1 className="font-sora font-bold text-3xl md:text-5xl tracking-tight mt-4 mb-5">
            Let's <span className="text-gradient-orange">talk</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Questions, feedback, or partnership ideas? Drop me a message and I'll get back to you.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <ContactForm />
        </motion.div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            Or find me on social
          </p>
          <div className="flex justify-center">
            <SocialLinks />
          </div>
        </div>
      </div>
    </section>
  );
}