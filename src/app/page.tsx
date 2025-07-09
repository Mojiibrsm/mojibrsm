'use client';
import Header from '@/components/sections/header';
import Hero from '@/components/sections/hero';
import About from '@/components/sections/about';
import Services from '@/components/sections/services';
import Experience from '@/components/sections/experience';
import Skills from '@/components/sections/skills';
import Portfolio from '@/components/sections/portfolio';
import Blog from '@/components/sections/blog';
import Contact from '@/components/sections/contact';
import Footer from '@/components/sections/footer';
import Pricing from '@/components/sections/pricing';

export default function Home() {
  return (
    <PortfolioPage />
  );
}

function PortfolioPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground" suppressHydrationWarning>
      <Header />
      <main className="flex-grow">
        <Hero />
        <About />
        <Services />
        <Experience />
        <Skills />
        <Portfolio />
        <Pricing />
        <Blog />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
