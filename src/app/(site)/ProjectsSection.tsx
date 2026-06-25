"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
  return (
    <section className="w-full py-20">
      <div className="width-padding mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center justify-center">

          {/* ── Text + Controls ── */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-start">
            <p className="text-[10px] font-bold tracking-widest uppercase text-black/55 mb-4">
              Templates
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-4">
              Cards for every
              <br />
              <span className="text-primary">occasion.</span>
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-8 ">
              Professionally designed greeting cards — weddings, birthdays,
              Eid, holidays and more. Pick one, personalise it, share in seconds.
            </p>

            <Link
              href="/templates"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Browse all templates <ArrowRight className="w-4 h-4" />
            </Link>
          </div>




   {/* ── Carousel ── */}
<div className="w-full lg:w-1/2 flex justify-center">
  <Carousel className="w-full max-w-[250px] lg:max-w-[320px]">
    <CarouselContent>
      {projects.map((project, index) => (
        <CarouselItem key={index} className="basis-full">
          <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={project.src}
              alt={project.category}
              fill
              className="object-cover"
            />
            <div className="absolute bottom-3 left-3">
              <span className="text-[10px] font-bold tracking-widest uppercase bg-white/80 text-black/60 px-2 py-1 rounded-full">
                {project.category}
              </span>
            </div>
          </div>
        </CarouselItem>
      ))}
    </CarouselContent>

    {/* Mobile: buttons neeche center mein */}
    <div className="flex justify-center gap-3 mt-4 lg:hidden">
      <CarouselPrevious className="static translate-x-0 translate-y-0" />
      <CarouselNext className="static translate-x-0 translate-y-0" />
    </div>

    {/* Desktop: buttons image ke left/right */}
    <CarouselPrevious className="hidden lg:flex -left-12 top-1/2 -translate-y-1/2" />
    <CarouselNext className="hidden lg:flex -right-12 top-1/2 -translate-y-1/2" />
  </Carousel>
</div>

        </div>
      </div>
    </section>
  );
}