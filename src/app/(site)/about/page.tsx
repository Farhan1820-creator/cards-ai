"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Wand2, Shield, Users, Globe, ArrowRight, Lock, Zap, Sparkles } from "lucide-react";

const visionImage = "https://res.cloudinary.com/dggey8rb6/image/upload/v1781094557/WhatsApp_Image_2026-06-10_at_12.50.07_wsom5m.jpg";

// ─── Utility Components ───────────────────────────────────────

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

interface StatItemProps {
  value: string;
  label: string;
}

function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="flex flex-col">
      <span className="text-2xl md:text-3xl font-black text-purple-600">{value}</span>
      <span className="text-[10px] font-bold tracking-[0.2em] uppercase mt-2 text-gray-500">{label}</span>
    </div>
  );
}

interface PrincipleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function PrincipleCard({ icon, title, description }: PrincipleCardProps) {
  return (
    <div className="p-5 md:p-6 bg-white rounded-2xl border border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all">
      <div className="w-10 h-10 mb-4 flex items-center justify-center bg-purple-50 rounded-xl text-purple-600">
        {icon}
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-600">{description}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────

export default function About() {
  return (
    <main className="text-gray-900 font-sans overflow-x-hidden">

      {/* Vision */}
{/* Vision */}
<section className="py-16 md:pb-24 px-6 md:px-8 max-w-9xl mx-auto">
  <div className="max-w-3xl mx-auto text-center space-y-6">

    <SectionHeading subtitle="Our Story" align="center">
      Cards for Every Occasion
    </SectionHeading>

    <div className="space-y-4 text-gray-600 leading-relaxed">
      <p>
        Founded in 2024, Cards AI was built on a simple belief — sending a thoughtful greeting card should be easy, beautiful, and personal.
      </p>
      <p>
        We offer a growing library of professionally designed templates for birthdays, weddings, holidays, and more. Pick a template, personalize it, and share it instantly.
      </p>
      <p className="font-semibold text-gray-900">
        Today, 50,000+ people trust Cards AI to help them express what words alone sometimes can't.
      </p>
    </div>

    <div className="flex items-center justify-center gap-12 pt-6 border-t border-purple-100">
      <StatItem value="50k+" label="Active Users" />
      <StatItem value="2M+" label="Cards Sent" />
      <StatItem value="500+" label="Templates" />
    </div>

  </div>
</section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-9xl mx-auto px-6 md:px-8">
          <SectionHeading subtitle="Why Cards AI" align="center">
            Everything You Need
          </SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <PrincipleCard
              icon={<Wand2 className="w-5 h-5" />}
              title="Beautiful Templates"
              description="Choose from hundreds of professionally designed cards for every occasion — birthdays, weddings, holidays, and more."
            />
            <PrincipleCard
              icon={<Shield className="w-5 h-5" />}
              title="Privacy First"
              description="Your messages and personal data stay private. We never share or sell your information."
            />
            <PrincipleCard
              icon={<Users className="w-5 h-5" />}
              title="Easy Sharing"
              description="Send cards digitally via link, email, or download them to print — your choice, every time."
            />
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-9xl mx-auto px-6 md:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 border border-purple-400/30 text-[10px] font-bold tracking-[0.3em] uppercase mb-5 text-purple-300">
              Built to Last
            </span>
            <h2 className="text-3xl md:text-4xl font-black">
              Reliable, Secure & Fast
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: <Lock className="w-5 h-5" />, title: "End-to-End Encryption", desc: "Your messages are encrypted in transit and at rest." },
              { icon: <Globe className="w-5 h-5" />, title: "Global Delivery", desc: "Send cards to anyone, anywhere, instantly." },
              { icon: <Zap className="w-5 h-5" />, title: "Instant Preview", desc: "See exactly how your card looks before you send it." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/30 transition-colors">
                <div className="text-purple-400 mb-4">{icon}</div>
                <h4 className="font-bold text-sm mb-2">{title}</h4>
                <p className="text-white/60 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-6 md:px-8 max-w-9xl mx-auto">
        <div className="bg-primary text-white rounded-3xl p-6 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          <div className="space-y-5">
            <div>
              <span className="inline-block px-3 py-1 border border-white/30 text-[10px] font-bold tracking-[0.25em] uppercase mb-4 text-purple-100">
                Get Started Today
              </span>
              <h2 className="text-2xl md:text-4xl font-black leading-tight mb-3">
                Ready to Send Something Special?
              </h2>
            </div>
            <p className="text-purple-100 leading-relaxed">
              Join 50,000+ people who use Cards AI to celebrate life's moments — big and small. Free to start, no credit card needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/dashboard"
                className="group inline-flex items-center justify-center gap-2 bg-white text-primary px-6 py-3.5 text-sm font-bold rounded-xl hover:bg-purple-50 transition-colors"
              >
                Browse Templates
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-bold border border-white/30 rounded-xl hover:bg-white/10 transition-colors"
              >
                Create Free Account
              </Link>
            </div>
          </div>

          <div className="relative h-[200px] md:h-[280px] rounded-2xl overflow-hidden border border-white/20">
            <Image
              src={visionImage}
              alt="Cards AI in action"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 p-3 bg-white/95 backdrop-blur rounded-xl shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-900">New Template Added</p>
                  <p className="text-[10px] text-gray-500">Summer Collection — 24 new designs</p>
                </div>
                <span className="text-[10px] font-bold text-purple-600">View</span>
              </div>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}