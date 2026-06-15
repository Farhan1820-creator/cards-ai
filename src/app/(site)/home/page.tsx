'use client';
import CTA from '@/app/(site)/home/CTA';
import Blocks from '@/app/(site)/home/Blocks'
import Hero from '@/app/(site)/home/HeroSection';
import ProjectSection from '@/app/(site)/home/ProjectsSection';

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


