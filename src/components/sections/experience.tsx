'use client';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';

export default function Experience() {
  const { t } = useLanguage();

  return (
    <section id="experience" className="w-full py-16 md:py-24 bg-card">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12 font-headline">{t.experience.title}</h2>
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-border hidden md:block"></div>
          {t.experience.jobs.map((job, index) => (
            <div key={index} className={`md:flex items-start mb-12 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
              <div className="md:w-1/2"></div>
              <div className="relative md:w-1/2">
                <div className="hidden md:block absolute top-1/2 -translate-y-1/2 bg-background p-2 rounded-full border-2 border-primary" style={index % 2 === 0 ? {right: 'calc(100% - 1.25rem)'} : {left: 'calc(100% - 1.25rem)'}}>
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{job.role}</CardTitle>
                        <CardDescription className="text-primary font-semibold">{job.company}</CardDescription>
                      </div>
                      <div className="text-sm text-muted-foreground whitespace-nowrap bg-secondary px-3 py-1 rounded-full">{job.period}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                      {job.responsibilities.map((resp, i) => (
                        <li key={i}>{resp}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
