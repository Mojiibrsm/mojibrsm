'use client';
import Image from 'next/image';
import { useLanguage } from '@/contexts/language-context';

export default function About() {
  const { t } = useLanguage();

  return (
    <section id="about" className="w-full py-16 md:py-24">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative group w-full max-w-md mx-auto">
             <Image
              src="https://placehold.co/600x600.png"
              alt="Mojib Rsm"
              width={600}
              height={600}
              className="relative rounded-lg shadow-lg w-full"
              data-ai-hint="man coding"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-foreground font-headline leading-tight">{t.about.title}</h2>
            <p className="text-muted-foreground">{t.about.bio}</p>
            <p className="text-muted-foreground">{t.about.mission}</p>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">{t.about.educationTitle}</h3>
              <p className="text-muted-foreground">{t.about.education}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
