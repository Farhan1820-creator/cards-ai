'use client';
import CTA from '@/app/(site)/CTA';
import Blocks from '@/app/(site)/Blocks'
import Hero from '@/app/(site)/HeroSection';
import ProjectSection from '@/app/(site)/ProjectsSection';

// import CTA from '@/components/cta';
export default function Home() {
  return (
    <div>
      <Hero />
      <CTA />
      <Blocks />
      <ProjectSection />
    </div>
  );
}


