"use client";

import React, { useState, FormEvent } from "react";
import { Mail, Phone, MapPin, Send, Github, Twitter, Instagram } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

const INITIAL_FORM: FormData = { name: "", email: "", subject: "", message: "" };

// ─── Data ─────────────────────────────────────────────────────

const contactInfo = [
  {
    icon: <Mail className="w-5 h-5" />,
    title: "Email Us",
    value: "hello@cardsai.com",
    link: "mailto:hello@cardsai.com",
  },
  {
    icon: <Phone className="w-5 h-5" />,
    title: "Call Us",
    value: "+1 (555) 123-4567",
    link: "tel:+15551234567",
  },
  {
    icon: <MapPin className="w-5 h-5" />,
    title: "Location",
    value: "123 Design Street, Creative City",
    link: "#",
  },
];

const faqs = [
  {
    question: "How quickly will I receive a response?",
    answer: "We aim to respond to all inquiries within 24–48 hours on business days.",
  },
  {
    question: "Can I request a custom template?",
    answer: "Yes! Reach out with your requirements and our team will get back to you with options.",
  },
  {
    question: "Is my data secure with Cards AI?",
    answer: "Absolutely. We use enterprise-grade encryption and never share your data with third parties.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────

const inputBase = "w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors";
const inputNormal = "border-gray-300 focus:ring-primary/40 focus:border-primary";
const inputError = "border-red-300 focus:ring-red-400/40 focus:border-red-400";

// ─── Page ─────────────────────────────────────────────────────

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitStatus("idle");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitStatus("success");
      setFormData(INITIAL_FORM);
    } catch (_) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen">

      {/* Hero */}
      <section className=" border-b border-gray-200">
        <div className="max-w-9xl mx-auto px-6 lg:px-8 py-16 lg:py-20 flex align-center">
          <div className="max-w-3xl mx-auto w-full text-center">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-primary mb-3">
              Contact
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
              Get in Touch
            </h1>
            <p className="text-gray-500 text-lg">
              Have questions about Cards AI? We're here to help. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-9xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid lg:grid-cols-3 gap-12">

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Send us a message</h2>

              {submitStatus === "success" && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  Thank you! Your message has been sent. We'll get back to you soon.
                </div>
              )}
              {submitStatus === "error" && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  Something went wrong. Please try again or email us at hello@cardsai.com
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className={`${inputBase} ${errors.name ? inputError : inputNormal}`}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`${inputBase} ${errors.subject ? inputError : inputNormal} bg-white`}
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing & Pricing</option>
                    <option value="partnership">Partnership Opportunities</option>
                    <option value="feedback">Feedback & Suggestions</option>
                  </select>
                  {errors.subject && <p className="mt-1 text-sm text-red-500">{errors.subject}</p>}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    className={`${inputBase} ${errors.message ? inputError : inputNormal} resize-vertical`}
                  />
                  {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground px-8 py-3 rounded-lg font-medium transition-opacity flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Contact Info */}
            <div className="bg-primary rounded-2xl p-6 border border-gray-100">
              <h3 className="text-base font-bold text-white mb-4">Contact Information</h3>
              <div className="space-y-4">
                {contactInfo.map((item) => (
                  <a
                    key={item.title}
                    href={item.link}
                    className="flex items-start gap-3 text-white transition-colors group"
                  >
                    <span className="mt-0.5 text-white">{item.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <p className="text-sm">{item.value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Social */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-4">Follow Us</h3>
              <div className="flex items-center gap-3">
                {[
                  { icon: <Twitter className="w-5 h-5" />, href: "#", label: "Twitter" },
                  { icon: <Instagram className="w-5 h-5" />, href: "#", label: "Instagram" },
                  { icon: <Github className="w-5 h-5" />, href: "#", label: "GitHub" },
                ].map(({ icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-primary/10 flex items-center justify-center text-gray-500 hover:text-primary transition-colors"
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}