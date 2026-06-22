"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [animating, setAnimating] = useState(false);

  const navigate = (index: number) => {
    if (animating || index === current) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 150);
  };

  const prev = () => navigate(current === 0 ? projects.length - 1 : current - 1);
  const next = () => navigate((current + 1) % projects.length);

  return (
    <section className="w-full py-16 px-6 md:px-12 lg:px-20">
       {/* Nav Row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {projects.map((_, i) => (
                <button
                  key={i}
                  onClick={() => navigate(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current ? 'bg-primary w-6' : 'bg-gray-300 hover:bg-gray-400 w-2'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={prev}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:scale-110 transition-all duration-200"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={next}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:scale-110 transition-all duration-200"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
        {/* Text */}
        <div className="lg:w-1/3 lg:pt-4 text-center lg:text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            A Collection of Our Best Templates
          </h2>
          <p className="mt-4 text-gray-500 text-sm md:text-base leading-relaxed">
            Browse AI-generated greeting cards crafted for every occasion — from weddings to birthdays and beyond.
          </p>
          <Link
            href="/templates"
            className="mt-6 inline-block bg-primary hover:bg-black text-white px-8 py-3 rounded-xl text-sm font-semibold transition-colors duration-200"
          >
            Browse Now
          </Link>
        </div>

        {/* Carousel */}
        <div className="lg:w-2/3 w-full flex flex-col gap-4">

          {/* Main Card */}
          <div className="relative w-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 h-[420px] sm:h-[500px]">
        
            <div className={`absolute inset-0 transition-opacity duration-150 ${animating ? 'opacity-0' : 'opacity-100'}`}>
              <Image
                src={projects[current].src}
                alt={projects[current].category}
                fill
                className="object-contain p-3"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
            </div>
            <span className={`absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-primary text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity duration-150 ${animating ? 'opacity-0' : 'opacity-100'}`}>
              {projects[current].category}
            </span>
          </div>

         
        </div>
      </div>
    </section>
  );
}