'use client';
import { LanguageProvider } from '@/contexts/language-context';
import Header from '@/components/sections/header';
import Hero from '@/components/sections/hero';
import About from '@/components/sections/about';
import Services from '@/components/sections/services';
import Portfolio from '@/components/sections/portfolio';
import Footer from '@/components/sections/footer';

export default function Home() {
  return (
    <LanguageProvider>
      <PortfolioPage />
    </LanguageProvider>
  );
}

function PortfolioPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Services />
        <About />
        <Portfolio />
      </main>
      <Footer />
    </div>
  );
}
