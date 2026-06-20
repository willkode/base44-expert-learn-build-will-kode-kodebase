import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, Mail, MessageCircle } from "lucide-react";
import { trackFormStart, trackFormSubmit, trackFormError, trackLead } from "@/lib/analytics";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "", website: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const startedRef = React.useRef(false);

  const set = (field) => (e) => {
    if (!startedRef.current) {
      startedRef.current = true;
      trackFormStart("contact_form");
    }
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const res = await base44.functions.invoke("submitContactForm", form);
      if (res.data?.error) {
        setError(res.data.error);
        trackFormError("contact_form", res.data.error);
      } else {
        setSent(true);
        trackFormSubmit("contact_form");
        trackLead({ leadType: "contact_request", formName: "contact_form" });
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Something went wrong. Please try again.";
      setError(msg);
      trackFormError("contact_form", msg);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="font-sora font-bold text-xl mb-2">Message sent!</h3>
        <p className="text-muted-foreground text-sm">Thanks for reaching out — I'll get back to you soon.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      {/* Contact Info — right side on desktop, top on mobile */}
      <div className="lg:col-span-2 lg:order-2 space-y-6">
        <div>
          <h3 className="font-sora font-bold text-lg mb-1">Get in Touch</h3>
          <p className="text-muted-foreground text-sm">Reach out directly — I respond within 24 hours.</p>
        </div>
        <a
          href="mailto:iamwillkode@gmail.com"
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 hover:border-primary/50 transition-colors group"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Email</p>
            <p className="text-sm font-medium group-hover:text-primary transition-colors">iamwillkode@gmail.com</p>
          </div>
        </a>
        <a
          href="https://wa.me/13343929401"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 hover:border-primary/50 transition-colors group"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">WhatsApp</p>
            <p className="text-sm font-medium group-hover:text-primary transition-colors">+1 (334) 392-9401</p>
          </div>
        </a>
      </div>

      {/* Form — left side */}
      <form onSubmit={handleSubmit} className="lg:col-span-3 lg:order-1 rounded-2xl border border-border bg-card p-6 md:p-8 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Name</Label>
          <Input id="contact-name" value={form.name} onChange={set("name")} placeholder="Your name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">Email</Label>
          <Input id="contact-email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="contact-phone">Phone <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input id="contact-phone" type="tel" value={form.phone} onChange={set("phone")} placeholder="(555) 123-4567" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-subject">Subject</Label>
          <Input id="contact-subject" value={form.subject} onChange={set("subject")} placeholder="What's this about?" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea id="contact-message" value={form.message} onChange={set("message")} placeholder="Tell me what's on your mind..." rows={6} required />
      </div>
      {/* Honeypot field — hidden from real users */}
      <input
        type="text"
        value={form.website}
        onChange={set("website")}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        type="submit"
        disabled={sending}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
      >
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Message"}
      </Button>
    </form>
    </div>
  );
}