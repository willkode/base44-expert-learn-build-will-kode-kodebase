import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "", website: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const res = await base44.functions.invoke("submitContactForm", form);
      if (res.data?.error) {
        setError(res.data.error);
      } else {
        setSent(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
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
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-5">
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
  );
}