import Link from "next/link";
import { ArrowUpRight } from "lucide-react";


export default function HeroSection() {
  return (
    <section className="relative w-full bg-[url(/hero_swgtra.png)] bg-cover sm:bg-center md:min-h-screen h-[550px]">
      {/* Background Image */}
      {/* <Image
        src={heroBg}
        alt="Cards AI hero background"
        fill
        className="object-cover object-right"
        priority
      /> */}

      {/* Dark overlay — heavier at bottom, light at top */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-white/15 to-white/5 z-10" />

      {/* Bottom-left Content */}
      <div className="flex flex-col justify-center w-full relative z-20 md:min-h-screen h-[550px] width-padding mx-auto">

        {/* Subtitle */}
        <p className="text-black/55 text-xs sm:text-sm font-medium uppercase tracking-widest mb-3">
          Start with Premium Templates
        </p>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-black leading-[1.05] mb-4 sm:mb-5">
          Create{' '}
          <span className="text-primary">Magic</span>
          <br className="hidden sm:block" />
          {' '}in Seconds
        </h1>

        {/* Description */}
        <p className="text-black/65  text-sm sm:text-base md:text-lg md:max-w-md max-w-[250px] mb-8 leading-relaxed">
          Choose from professionally designed templates and create beautiful, personalized greeting cards in minutes.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full text-sm font-bold hover:bg-black/90 transition-all shadow-lg w-fit"
          >
            Start Creating
            <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 bg-white text-primary backdrop-blur-sm border border-primary/25  px-7 py-3.5 rounded-full text-sm font-medium hover:bg-white/70 transition-all w-fit"
          >
            View Templates
            <ArrowUpRight className="w-4 h-4 opacity-60" />
          </Link>
        </div>
      </div>
    </section>
  );
}