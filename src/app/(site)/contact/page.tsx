"use client";

import { Mail, Phone, MessageCircle, Twitter, Instagram, Facebook, Linkedin } from "lucide-react";

const faqs = [
  {
    q: "How quickly will you respond?",
    a: "We aim to reply to all messages within 24–48 hours on business days.",
  },
  {
    q: "Can I request a custom template?",
    a: "Yes! Send us your requirements via email and our team will get back to you with options.",
  },
  {
    q: "I found a bug — who do I contact?",
    a: "Email us at info@taibacreations.com with a short description and we'll look into it right away.",
  },
  {
    q: "Is Cards AI free to use?",
    a: "Yes, Cards AI is free to start — no credit card needed. Create an account and start generating cards today.",
  },
];

export default function ContactPage() {
  return (
    <main className="bg-white text-gray-900 font-sans overflow-x-hidden flex flex-col justify-center items-center">

      {/* ── Hero ── */}
      <section className="width-padding pt-20 pb-16  mx-auto text-center">
        <p className="text-[10px] font-bold tracking-widest uppercase text-black/55 mb-6">
          Contact
        </p>
        <h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight text-gray-900">
          We&apos;re here to
          <br />
          <span className="text-primary">help.</span>
        </h1>
        <p className="mt-6 text-base md:text-lg text-gray-500 leading-relaxed max-w-4xl mx-auto">
          Got a question, feedback, or a custom request? Reach out through
          any of the channels below — we usually respond within 24 hours.
        </p>
      </section>

      {/* ── Divider ── */}
      <div className="width-padding mx-auto">
        <div className="h-px bg-gray-100" />
      </div>

      {/* ── Contact Channels ── */}
      <section className="width-padding py-16 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Email */}
          <a
            href="mailto:info@taibacreations.com"
            className="group rounded-2xl border border-gray-100 p-7 hover:border-primary/30 hover:shadow-sm transition-all flex flex-col gap-4"
          >
            <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-black/55 mb-1">
                Email
              </p>
              <p className="text-sm font-bold text-gray-900 mb-1">
                info@taibacreations.com
              </p>
              <p className="text-xs text-gray-400">
                For general queries & support
              </p>
            </div>
            <span className="text-xs font-semibold text-primary group-hover:underline mt-auto">
              Send an email →
            </span>
          </a>

          {/* Phone */}
          <a
            href="tel:+923341100088"
            className="group rounded-2xl border border-gray-100 p-7 hover:border-primary/30 hover:shadow-sm transition-all flex flex-col gap-4"
          >
            <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-black/55 mb-1">
                Phone
              </p>
              <p className="text-sm font-bold text-gray-900 mb-1">
                +92 334 1100088
              </p>
              <p className="text-xs text-gray-400">
                Business days, 9 AM – 6 PM PKT
              </p>
            </div>
            <span className="text-xs font-semibold text-primary group-hover:underline mt-auto">
              Call now →
            </span>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/923341100088"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-gray-100 p-7 hover:border-primary/30 hover:shadow-sm transition-all flex flex-col gap-4"
          >
            <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-black/55 mb-1">
                WhatsApp
              </p>
              <p className="text-sm font-bold text-gray-900 mb-1">
                +92 334 1100088
              </p>
              <p className="text-xs text-gray-400">
                Quick replies, usually same day
              </p>
            </div>
            <span className="text-xs font-semibold text-primary group-hover:underline mt-auto">
              Chat on WhatsApp →
            </span>
          </a>

        </div>
      </section>

      {/* ── Divider ── */}
      <div className="width-padding mx-auto ">
        <div className="h-px bg-gray-100" />
      </div>

      {/* ── FAQ ── */}
      <section className="width-padding py-16  mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          <div className="text-center lg:text-start">
            <p className="text-[10px] font-bold tracking-widest uppercase text-black/55 mb-4">
              FAQ
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-4">
              Common questions
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Can&apos;t find what you&apos;re looking for? Email us at{" "}
              <a
                href="mailto:info@taibacreations.com"
                className="text-primary font-semibold hover:underline"
              >
                info@taibacreations.com
              </a>{" "}
              and we&apos;ll get back to you.
            </p>
          </div>

          <div className="divide-y divide-gray-100 border-y border-gray-100">
            {faqs.map((faq) => (
              <div key={faq.q} className="py-5 text-center lg:text-start">
                <p className="text-sm font-bold text-gray-900 mb-1.5">{faq.q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Divider ── */}
      <div className="width-padding mx-auto ">
        <div className="h-px bg-gray-100" />
      </div>

      {/* ── Social + Bottom note ── */}
      <section className=" py-12 width-padding mx-auto">
        <div className="flex flex-col items-center gap-5 text-center">

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {[
              { icon: <Facebook className="w-4 h-4" />, href: "https://www.facebook.com/taibacreations", label: "Facebook" },
              { icon: <Instagram className="w-4 h-4" />, href: "https://www.instagram.com/taibacreations", label: "Instagram" },
              { icon: <Twitter className="w-4 h-4" />, href: "https://twitter.com/taibacreations", label: "Twitter" },
              { icon: <Linkedin className="w-4 h-4" />, href: "https://www.linkedin.com/company/taibacreations", label: "LinkedIn" },
            ].map(({ icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all"
              >
                {icon}
              </a>
            ))}
          </div>

          <p className="text-sm text-gray-400">
            Cards AI is a product of{" "}
            <a
              href="https://taibacreations.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold hover:underline"
            >
              Taiba Creations
            </a>
            {" "}— a full-service IT agency based in Pakistan.
          </p>

        </div>
      </section>

    </main>
  );
}