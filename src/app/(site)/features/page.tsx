"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────

const TEMPLATE_STEPS = [
  "Choose a template from the library",
  "Fill in the recipient name & your message",
  "Upload a personal photo",
  "Hit Generate — card is ready in seconds",
];

const TEMPLATE_ACTIONS = [
  "Download as PNG or JPG",
  "Share via link",
  "Regenerate with one click",
  "Reset and start over",
];

const AI_INPUTS = [
  "Pick a category (birthday, wedding, Eid…)",
  "Enter recipient name & your message",
  "Choose a style — minimal, elegant, fun…",
  "Select a colour theme",
];

const AI_ACTIONS = [
  "Download as PNG or JPG",
  "Share via link",
  "Regenerate with one click",
  "Reset and start over",
];

// ─── Small helper ─────────────────────────────────────────────

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5 ">
      {items.map((item) => (
        <li key={item} className="flex items-start justify-center gap-2.5 text-sm text-gray-500 lg:justify-start">
          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

// ─── Page ─────────────────────────────────────────────────────

export default function FeaturesPage() {
  return (
    <main className="bg-white text-gray-900 font-sans overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="px-6 md:px-12 pt-20 pb-16 max-w-5xl mx-auto text-center">
        <p className="text-[10px] font-bold tracking-widest uppercase text-black/55 mb-6">
          Features
        </p>
        <h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight text-gray-900">
          Everything Cards AI
          <br />
          <span className="text-primary">can do for you.</span>
        </h1>
        <p className="mt-6 text-base md:text-lg text-gray-500 leading-relaxed max-w-xl mx-auto">
          Two ways to create beautiful greeting cards — template-based in minutes,
          or fully AI-generated. Plus a dashboard to manage everything you&apos;ve made.
        </p>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div className="h-px bg-gray-100" />
      </div>

      {/* ── Template Flow ── */}
      <section className="px-6 md:px-12 py-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center lg:items-start">

          <div className="text-center lg:text-start">
            <p className="text-[10px] font-bold tracking-widest uppercase text-black/55 mb-4">
              Method 01
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-4">
              Template-Based Cards
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Browse hundreds of professionally designed templates for every
              occasion — birthdays, weddings, Eid, holidays, and more. Personalise
              in four simple steps and your card is ready.
            </p>
            <CheckList items={TEMPLATE_STEPS} />
          </div>

          <div className="rounded-2xl border border-gray-100 p-7 hover:border-primary/30 hover:shadow-sm transition-all text-center lg:text-start">
            <p className="text-[10px] font-bold tracking-widest uppercase text-black/55 mb-4">
              After generating
            </p>
            <h3 className="text-base font-black text-gray-900 mb-5">
              What you can do with your card
            </h3>
            <CheckList items={TEMPLATE_ACTIONS} />
            <div className="mt-7 pt-5 border-t border-gray-100">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
              >
                Browse templates <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div className="h-px bg-gray-100" />
      </div>

      {/* ── AI Flow ── */}
      <section className="px-6 md:px-12 py-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 text-center lg:text-start">

          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-black/55 mb-4">
              Method 02
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-2">
              AI-Generated Cards
            </h2>
            <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-4">
              Coming soon
            </span>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Skip the template entirely. Just describe what you want — the AI
              picks the layout, colours, and copy — and hands you a unique card
              in seconds.
            </p>
            <CheckList items={AI_INPUTS} />
          </div>

          <div className="rounded-2xl border border-gray-100 p-7 opacity-70 relative overflow-hidden">
            <p className="text-[10px] font-bold tracking-widest uppercase text-black/55 mb-4">
              After generating
            </p>
            <h3 className="text-base font-black text-gray-900 mb-5">
              Same actions, fully AI-made card
            </h3>
            <CheckList items={AI_ACTIONS} />
            <div className="mt-7 pt-5 border-t border-gray-100">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Available soon
              </span>
            </div>
            {/* stripe overlay */}
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg,transparent,transparent 6px,rgba(0,0,0,0.015) 6px,rgba(0,0,0,0.015) 12px)",
              }}
            />
          </div>

        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div className="h-px bg-gray-100" />
      </div>

      {/* ── Dashboard / Recent Projects ── */}
      <section className="px-6 md:px-12 py-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center text-center lg:text-start">

          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-black/55 mb-4">
              Your Dashboard
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-4">
              All your cards, one place
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Every card you generate is saved to your personal dashboard.
              View, re-download, share, or delete past cards any time — no
              hunting through your downloads folder.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "View recent cards", desc: "All your generated cards in one grid." },
              { label: "Re-download anytime", desc: "PNG or JPG, whenever you need it." },
              { label: "Share past cards", desc: "Grab the shareable link again in a click." },
              { label: "Delete & manage", desc: "Keep your workspace clean and organised." },
            ].map(({ label, desc }) => (
              <div
                key={label}
                className="rounded-xl border border-gray-100 p-4 hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <p className="text-sm font-bold text-gray-900 mb-1">{label}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 md:px-12 pb-20 max-w-5xl mx-auto">
        <div className="bg-primary rounded-2xl px-8 py-10 md:py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-primary-foreground leading-tight">
              Start creating your first card.
            </h2>
            <p className="mt-2 text-sm text-primary-foreground/75">
              Free to start. No credit card needed.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary px-6 py-3 text-sm font-bold rounded-xl hover:bg-blue-50 transition-colors"
            >
              Browse Templates <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold border border-primary-foreground/30 text-primary-foreground rounded-xl hover:bg-white/10 transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}