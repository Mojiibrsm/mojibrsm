'use client';
import Image from 'next/image';
import { useLanguage } from '@/contexts/language-context';
import { Card } from '@/components/ui/card';

export default function Portfolio() {
  const { t } = useLanguage();
  const imageHints = ["lighthouse illustration", "abstract branding", "letter logo"];

  return (
    <section id="portfolio" className="w-full py-16 md:py-24 bg-card">
      <div className="container">
        <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-headline">{t.portfolio.title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {t.portfolio.projects.map((project, index) => (
            <Card key={project.title} className="overflow-hidden group shadow-md hover:shadow-2xl transition-all duration-300 rounded-2xl">
              <a href={project.link} target="_blank" rel="noopener noreferrer">
                <Image
                  src={`https://placehold.co/600x400.png`}
                  alt={project.title}
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  data-ai-hint={imageHints[index % imageHints.length]}
                />
              </a>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
