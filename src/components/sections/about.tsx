'use client';
import Image from 'next/image';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, User, Rocket } from 'lucide-react';

export default function About() {
  const { t } = useLanguage();

  return (
    <section id="about" className="w-full py-16 md:py-24">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12 font-headline">{t.about.title}</h2>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="relative group w-full max-w-md mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <Image
              src="https://placehold.co/600x600.png"
              alt="Mojib Rsm"
              width={600}
              height={600}
              className="relative rounded-lg shadow-lg w-full"
              data-ai-hint="man portrait"
            />
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <User className="w-8 h-8 text-primary" />
                <CardTitle>{t.about.bioTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.about.bio}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <GraduationCap className="w-8 h-8 text-primary" />
                <CardTitle>{t.about.educationTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.about.education}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <Rocket className="w-8 h-8 text-primary" />
                <CardTitle>{t.about.missionTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.about.mission}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
