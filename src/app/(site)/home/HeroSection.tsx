import Link from "next/link";
import Image from "next/image";

const heroImg1 = "https://res.cloudinary.com/dggey8rb6/image/upload/v1781088375/1135w-YaSKt4OQVNk_szxk8a.webp";
const heroImg2 = "https://res.cloudinary.com/dggey8rb6/image/upload/v1781088413/images_8_s3zgfi.jpg";

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden py-16 sm:py-20 md:py-24">
      <div className="relative max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[60vh] flex items-center justify-center">

        {/* Desktop Card - Left */}
        <div className="hidden md:block absolute left-4 lg:left-8 xl:left-16 top-1/2 -translate-y-1/2 w-[160px] lg:w-[210px] xl:w-[260px] z-0 pointer-events-none">
          <div className="relative aspect-[3/4] rounded-2xl xl:rounded-3xl shadow-2xl rotate-[-6deg] overflow-hidden">
            <Image src={heroImg1} alt="Botanical greeting card" fill className="object-cover" />
          </div>
        </div>

        {/* Desktop Card - Right */}
        <div className="hidden md:block absolute right-4 lg:right-8 xl:right-16 top-1/2 -translate-y-1/2 w-[160px] lg:w-[210px] xl:w-[260px] z-0 pointer-events-none">
          <div className="relative aspect-[3/4] rounded-2xl xl:rounded-3xl shadow-2xl rotate-[6deg] overflow-hidden">
            <Image src={heroImg2} alt="Birthday greeting card" fill className="object-cover" />
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 w-full max-w-2xl mx-auto text-center px-2 flex flex-col items-center">

          {/* Mobile Cards — flow mein, content ke upar */}
          <div className="flex md:hidden items-end justify-center gap-4 mb-8 pointer-events-none">
            <div className="relative w-[100px] h-[130px] rounded-xl shadow-lg rotate-[-6deg] overflow-hidden flex-shrink-0">
              <Image src={heroImg1} alt="Botanical greeting card" fill className="object-cover" />
            </div>
            <div className="relative w-[100px] h-[130px] rounded-xl shadow-lg rotate-[6deg] overflow-hidden flex-shrink-0">
              <Image src={heroImg2} alt="Birthday greeting card" fill className="object-cover" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight">
            Create <span className="text-purple-600">Magic</span> in Seconds
          </h1>

          <p className="text-gray-500 text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            The world&aposs most sophisticated AI-powered greeting card generator.
            Professional designs, personalized messages, and instant delivery.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center w-full sm:w-auto">
            <Link
              href="/dashboard"
              className="bg-primary text-white text-sm font-bold px-8 py-4 rounded-2xl shadow-lg shadow-purple-300/50 hover:shadow-xl hover:shadow-purple-400/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Start Creating for Free
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-xl font-medium transition-colors text-sm"
            >
              View Templates
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}