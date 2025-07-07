'use client';
import Image from 'next/image';
import { useLanguage } from '@/contexts/language-context';
import { CheckCircle } from 'lucide-react';

export default function About() {
  const { t } = useLanguage();

  return (
    <section id="about" className="w-full py-16 md:py-24">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-foreground font-headline leading-tight">{t.about.title}</h2>
            <p className="text-muted-foreground">{t.about.description}</p>
            <ul className="space-y-4">
              {t.about.points.map((point, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-primary" />
                  <span className="font-medium">{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative group w-full max-w-md mx-auto">
            <div className="absolute -inset-2 bg-gradient-to-br from-primary via-purple-400 to-accent rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <Image
              src="https://placehold.co/600x600.png"
              alt="Mojib Rsm"
              width={600}
              height={600}
              className="relative rounded-lg shadow-lg w-full"
              data-ai-hint="man pointing"
            />
             <div className="absolute bottom-10 -right-10 bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-lg flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-full">
                    <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15h14a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg>
                </div>
                <div>
                    <p className="font-bold">24 Hours active</p>
                    <p className="text-sm text-muted-foreground">start your problem</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
