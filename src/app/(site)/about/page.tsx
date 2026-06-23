"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";

const visionImage ="https://res.cloudinary.com/dggey8rb6/image/upload/v1782189865/unnamed_mmmub6.webp"
export default function About() {
  return (
    <main className="bg-white text-gray-900 font-sans overflow-x-hidden flex flex-col justify-center items-center">

      {/* ── Hero ── */}
      <section className="width-padding pt-20 pb-16 mx-auto text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-black/55 mb-6">
          About Cards AI
        </p>
        <h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight text-gray-900">
          Greeting cards,
          <br />
          <span className="text-primary">made in seconds.</span>
        </h1>
        <p className="mt-6 text-base md:text-lg text-gray-500 leading-relaxed max-w-4xl mx-auto">
          Cards AI gives you a growing library of professionally designed
          templates. Pick one, personalise it, and share — done in under a
          minute.
        </p>
      </section>

      {/* ── Divider ── */}
      <div className="mx-auto width-padding">
        <div className="h-px bg-gray-100" />
      </div>

      {/* ── How it works ── */}
      <section className="width-padding py-16 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Method 1 — Templates */}
          <div className="rounded-2xl border border-gray-100 p-7 hover:border-primary/30 hover:shadow-sm transition-all">
            <span className="text-[10px] font-bold tracking-widest uppercase text-primary">
              Method 01
            </span>
            <h2 className="mt-3 text-xl font-black text-gray-900">
              Browse & Personalise
            </h2>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              Choose from hundreds of templates — birthdays, weddings,
              Eid, holidays and more. Add your recipient&apos;s name, a
              personal message, and your photo. Your card is ready to
              share as a link or download to print.
            </p>
            <Link
              href="/dashboard"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
            >
              Browse templates <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Method 2 — AI (Coming Soon) */}
          <div className="rounded-2xl border border-gray-100 p-7 relative overflow-hidden opacity-70">
            <span className="text-[10px] font-bold tracking-widest uppercase text-primary">
              Method 02
            </span>
            <h2 className="mt-3 text-xl font-black text-gray-900">
              Describe & Generate
            </h2>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              Tell our AI what you&apos;re celebrating, who the card is
              for, and the mood you want. It handles the rest — layout,
              colours, copy — and hands you a unique card in seconds.
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-400">
              Coming soon
            </span>
            {/* subtle stripe overlay */}
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
      <div className="width-padding mx-auto ">
        <div className="h-px bg-gray-100" />
      </div>

      {/* ── Stats ── */}
      {/* <section className="px-6 md:px-12 py-14 max-w-full text-center mx-auto">
        <div className="flex flex-wrap gap-12 max-w-full items-center justify-center">
          {[
            { value: "50k+", label: "Active users" },
            { value: "2M+",  label: "Cards sent"   },
            { value: "500+", label: "Templates"    },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl md:text-4xl font-black text-primary">{value}</p>
              <p className="mt-1 text-[10px] font-bold tracking-widest uppercase text-gray-400">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section> */}

      {/* ── Divider ── */}
      <div className="width-padding mx-auto">
        <div className="h-px bg-gray-100" />
      </div>

      {/* ── Built by Taiba Creations ── */}
      <section className=" py-16 width-padding  sm:max-w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center sm:justify-center">
          <div className="text-center lg:text-start">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-4">
              Behind the product
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-4">
              A project by<br />Taiba Creations
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-3">
              Cards AI is built by{" "}
              <a
                href="https://taibacreations.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:underline inline-flex items-center gap-0.5"
              >
                Taiba Creations
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
              , a full-service IT agency led by{" "}
              <span className="font-semibold text-gray-700">Khalid Mehmood</span>.
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              The agency specialises in web design, mobile development,
              e-commerce, branding, and digital marketing — and Cards AI
              is their flagship product demonstrating what thoughtful
              design and modern AI can do together.
            </p>
          </div>

          <div className="relative h-56 md:h-64 rounded-2xl overflow-hidden border border-gray-100">
            <Image
              src={visionImage}
              alt="Cards AI preview"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className=" pb-20 width-padding mx-auto">
        <div
          className="rounded-2xl px-8 py-10 md:py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          style={{ backgroundColor: "#4E99DF" }}
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
              Ready to send something special?
            </h2>
            <p className="mt-2 text-sm text-white/75">
              Free to start. No credit card needed.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/templates"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary px-6 py-3 text-sm font-bold rounded-xl hover:bg-blue-50 transition-colors"
            >
              Browse Templates <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold border border-white/30 text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}