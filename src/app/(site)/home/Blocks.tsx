"use client";

// import { motion } from "framer-motion";
import { PencilRuler, Wand2, Download, Share2, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: PencilRuler,
    title: "Design",
    desc: "Tell our AI what kind of card you envision — mood, theme, occasion, style.",
  },
  {
    icon: Wand2,
    title: "Generate",
    desc: "You creates multiple ultra-premium designs.",
  },
  {
    icon: ArrowRight,
    title: "Refine",
    desc: "Tweak colors, fonts, and layout with simple, intuitive controls.",
  },
  {
    icon: Download,
    title: "Export",
    desc: "Download , share instantly, or print directly. It's that simple.",
  },
];

export default function Blocks() {
  return (
    <section
      id="how"
      className="relative py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-primary-200 mb-6"></div>
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Four Steps to
            <br />
            <span className="luxury-text">Perfection</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From idea to masterpiece in minutes. Our process is engineered for
            speed without compromising quality.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="group relative"
                >
                <div className="relative glass rounded-3xl p-8 border border-purple-200/40 hover:border-purple-400/60 transition-all duration-500 h-full overflow-hidden">
                  

                  <div className="relative">
<div className="w-14 h-14 rounded-2xl bg-primary  flex items-center justify-center shadow-lg shadow-primary-500/30 mb-6 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">
                      {s.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
