"use client";

import { Mail, Phone, MapPin, Clock, Github, Twitter, Instagram } from "lucide-react";
import Image from "next/image";

const contactInfo = [
  {
    icon: <Mail className="w-5 h-5" />,
    title: "Email us",
    value: "hello@cardsai.com",
    link: "mailto:hello@cardsai.com",
    linkLabel: "Send an email",
  },
  {
    icon: <Phone className="w-5 h-5" />,
    title: "Call us",
    value: "+1 (555) 123-4567",
    link: "tel:+15551234567",
    linkLabel: "Call now",
  },
  {
    icon: <MapPin className="w-5 h-5" />,
    title: "Location",
    value: "123 Design Street",
    sub: "Creative City",
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: "Response time",
    value: "Within 24–48 hrs",
    sub: "Business days only",
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

const socials = [
  { icon: <Twitter className="w-4 h-4" />, href: "#", label: "Twitter" },
  { icon: <Instagram className="w-4 h-4" />, href: "#", label: "Instagram" },
  { icon: <Github className="w-4 h-4" />, href: "#", label: "GitHub" },
];

interface SectionHeadingProps {
  children: React.ReactNode;
  subtitle?: string;
  align?: "left" | "center";
  inverse?: boolean;
}


function SectionHeading({ children, subtitle, align = "left", inverse = false }: SectionHeadingProps) {
  return (
    <div className={`mb-10 md:mb-14 ${align === "center" ? "text-center" : ""}`}>
      {subtitle && (
        <span className={`inline-block text-[10px] font-bold tracking-[0.35em] uppercase mb-4 ${
          inverse ? "text-purple-200" : "text-purple-600"
        }`}>
          {subtitle}
        </span>
      )}
      <h2 className={`text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight ${
        inverse ? "text-white" : "text-gray-900"
      }`}>
        {children}
      </h2>
    </div>
  );
}

export default function ContactPage() {
  return (
    <main className="min-h-screen">

      {/* ── Hero ── */}
      <section className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16 lg:py-20 text-center flex flex-col items-center justify-center">
   <SectionHeading subtitle="Contact" align="center">
      Get in touch
    </SectionHeading>
          <p className="text-gray-500 text-lg max-w-xl">
            Have questions about Cards AI? We are here to help. Reach out through any of the
            channels below and we will respond as soon as possible.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16 space-y-16">

        {/* ── Illustration banner ── */}
        <div className="relative rounded-2xl overflow-hidden border border-gray-100 bg-primary/5 h-72 flex items-center justify-center">
          <Image
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvdCLAeueNNp56xjGhmaGBeY5N822MWgGrM0F0veACHw&s=10"  
            alt="Contact illustration"
            fill
            className="object-cover object-top"
          />
          {/* fallback text agar image nahi */}
          <p className="relative z-10 text-gray/40 text-sm select-none">
            We reply within 24 hours
          </p>
        </div>

        {/* ── Contact cards ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactInfo.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                {item.icon}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">{item.title}</p>
                <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                {item.link ? (
                  <a href={item.link} className="text-xs text-primary mt-1 inline-block hover:underline">
                    {item.linkLabel}
                  </a>
                ) : (
                  <span className="text-xs text-gray-400 mt-1 inline-block">{item.sub}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── FAQ ── */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-5">Frequently asked questions</h2>
          <div className="divide-y divide-gray-100 border-y border-gray-100">
            {faqs.map((faq) => (
              <div key={faq.question} className="py-5">
                <p className="text-sm font-semibold text-gray-900 mb-1.5">{faq.question}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Social ── */}
        <div className="flex flex-wrap items-center gap-3">
          {socials.map(({ icon, href, label }) => (
            <a
              key={label}
              href={href}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {icon}
              {label}
            </a>
          ))}
        </div>

      </div>
    </main>
  );
}