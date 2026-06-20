import React from "react";
import { motion } from "framer-motion";
import ContactForm from "@/components/contact/ContactForm";

import Seo from "@/components/seo/Seo";

export default function Contact() {
  return (
    <section className="py-24 relative">
      <Seo
        title="Contact KodeBase — Get Help Building Your App"
        description="Questions, feedback, or partnership ideas? Reach the KodeBase team and get a fast, personal reply."
        path="/contact"
        image="https://media.base44.com/images/public/6a1905a0bc76553d6c934574/7c583194a_generated_image.png"
      />
      <div className="max-w-5xl mx-auto px-6">
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


      </div>
    </section>
  );
}