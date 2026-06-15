"use client";

import React from "react";
import Link from "next/link";
import {
  Wand2, Palette, Layers, Download, Sparkles,
  Zap, Share2, ImageIcon,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// ─── Data ─────────────────────────────────────────────────────

const FEATURES_GENERATE: Feature[] = [
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Template-Based Creation",
    description: "Pick from hundreds of occasions and styles. Every template is ready to personalize in seconds.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Instant Preview",
    description: "See your card come to life as you edit — no waiting, no guessing.",
  },
  {
    icon: <ImageIcon className="w-6 h-6" />,
    title: "Photo Uploads",
    description: "Add your own photos to any template and make every card uniquely yours.",
  },
  {
    icon: <Share2 className="w-6 h-6" />,
    title: "One-Click Sharing",
    description: "Send via link or email, or download in PNG, PDF, and JPG formats.",
  },
];

const FEATURES_EDITOR: Feature[] = [
  {
    icon: <Palette className="w-6 h-6" />,
    title: "500+ Premium Templates",
    description: "Professionally designed templates for birthdays, weddings, holidays, business, and every occasion.",
  },
  {
    icon: <Layers className="w-6 h-6" />,
    title: "Drag & Drop Editor",
    description: "Customize any template with our intuitive editor. Change colors, fonts, images, and layout effortlessly.",
  },
  {
    icon: <Wand2 className="w-6 h-6" />,
    title: "Style Suggestions",
    description: "Get recommendations for color palettes, typography, and layouts that suit your occasion.",
  },
  {
    icon: <Download className="w-6 h-6" />,
    title: "Print-Ready Exports",
    description: "Download high-resolution files optimized for professional printing or digital sharing.",
  },
];

// ─── Utility Components ───────────────────────────────────────

function SectionHeading({
  title,
  subtitle,
  align = "left",
}: {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`mb-12 ${align === "center" ? "text-center" : ""}`}>
      {subtitle && (
        <span className="inline-block text-xs font-bold tracking-widest uppercase text-primary mb-3">
          {subtitle}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
        {title}
      </h2>
    </div>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <div className="flex flex-col items-center justify-center bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5">
        {feature.icon}
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-2">{feature.title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────

export default function FeaturesPage() {
  return (
    <main className="min-h-screen">

      {/* Two Ways to Create */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-9xl mx-auto">
          <SectionHeading
            title="Two Ways to Create"
            subtitle="Choose Your Style"
            align="center"
          />

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">

            {/* Option 1 */}
            <div className="group relative bg-white rounded-3xl p-8 border-2 border-transparent hover:border-primary/40 transition-all">
              <div className="absolute inset-0 bg-primary/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground mb-6">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Start from a Template</h3>
                <p className="text-gray-500 mb-6 leading-relaxed">
                  Browse our library of professionally designed templates. Pick one, personalize it, and send — done in minutes.
                </p>
                <ul className="space-y-2 mb-8">
                  {["500+ templates", "All occasions covered", "Instant customization", "No design skills needed"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/templates"
                  className="block w-full text-center bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  Browse Templates →
                </Link>
              </div>
            </div>

            {/* Option 2 */}
            <div className="group relative bg-white rounded-3xl p-8 border-2 border-transparent hover:border-primary/40 transition-all">
              <div className="absolute inset-0 bg-primary/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground mb-6">
                  <Palette className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Build Your Own</h3>
                <p className="text-gray-500 mb-6 leading-relaxed">
                  Use our drag-and-drop editor to create a card from scratch. Full control over layout, colors, fonts, and images.
                </p>
                <ul className="space-y-2 mb-8">
                  {["Drag & drop editor", "Upload your photos", "Custom colors & fonts", "Print-ready exports"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/dashboard"
                  className="block w-full text-center bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  Open Editor →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Creation Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-9xl mx-auto w-full text-center">
          <SectionHeading title="Everything You Need to Create" subtitle="Features" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES_GENERATE.map((feature, idx) => (
              <FeatureCard key={idx} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Editor Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-9xl mx-auto w-full text-center">
          <SectionHeading title="A Powerful Editor" subtitle="Customize Everything" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES_EDITOR.map((feature, idx) => (
              <FeatureCard key={idx} feature={feature} />
            ))}
          </div>
        </div>
      </section>

     

    </main>
  );
}