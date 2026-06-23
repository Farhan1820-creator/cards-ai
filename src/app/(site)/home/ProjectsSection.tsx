"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const projects = [
  {
    src: "https://res.cloudinary.com/dggey8rb6/image/upload/v1781092945/941e5cd43d7f7aea5b43bcdaf34f98df_xwjqne.jpg",
    category: "Wedding",
  },
  {
    src: "https://res.cloudinary.com/dggey8rb6/image/upload/v1781088413/images_8_s3zgfi.jpg",
    category: "Wedding",
  },
  {
    src: "https://res.cloudinary.com/dggey8rb6/image/upload/v1781091788/1a2f3ab1ddc758b3b1fb0961e317d0fb_dmxvzz.jpg",
    category: "Birthday",
  },
  {
    src: "https://res.cloudinary.com/dggey8rb6/image/upload/v1781092946/c87c49c0b7b5933c33a5184ecc64d00b_ntkqjb.jpg",
    category: "Wedding",
  },
  {
    src: "https://res.cloudinary.com/dggey8rb6/image/upload/v1781092302/4cd1cbb06538b168b0615f274f5c9999_qbwt0h.jpg",
    category: "Wedding",
  },
];

export default function TemplatesSection() {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  const goTo = (index: number) => {
    if (fading || index === current) return;
    setFading(true);
    setTimeout(() => {
      setCurrent(index);
      setFading(false);
    }, 180);
  };

  const prev = () => goTo(current === 0 ? projects.length - 1 : current - 1);
  const next = () => goTo((current + 1) % projects.length);

  return (
    <section className="w-full py-20 flex flex-col justify-center items-center">
      <div className="width-padding mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">

          {/* ── Portrait Card ── */}
          <div className="w-full lg:w-auto flex justify-center shrink-0">
            <div className="relative w-[280px] sm:w-[320px]">

              {/* main card */}
              <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm aspect-[3/4] bg-gray-50">
                <Image
                  src={projects[current].src}
                  alt={projects[current].category}
                  fill
                  className={`object-cover transition-opacity duration-180 ${fading ? "opacity-0" : "opacity-100"}`}
                  sizes="320px"
                  priority
                />
                {/* category pill */}
                <span className={`absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-primary text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-lg transition-opacity duration-180 ${fading ? "opacity-0" : "opacity-100"}`}>
                  {projects[current].category}
                </span>
              </div>
            </div>
          </div>

          {/* ── Text + Controls ── */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-start">
            <p className="text-[10px] font-bold tracking-widest uppercase text-black/55 mb-4">
              Templates
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-4">
              Cards for every
              <br />
              <span className="text-primary">occasion.</span>
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-sm">
              Professionally designed greeting cards — weddings, birthdays,
              Eid, holidays and more. Pick one, personalise it, share in seconds.
            </p>

            <Link
              href="/templates"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity mb-10"
            >
              Browse all templates <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Nav controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={prev}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 hover:border-primary/40 hover:text-primary transition-all"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* dots */}
              <div className="flex items-center gap-1.5">
                {projects.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === current ? "bg-primary w-5" : "bg-gray-200 hover:bg-gray-300 w-1.5"
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 hover:border-primary/40 hover:text-primary transition-all"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* counter */}
            <p className="mt-3 text-xs text-gray-400 tabular-nums">
              {String(current + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}