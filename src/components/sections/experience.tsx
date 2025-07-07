'use client';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function Experience() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const leftVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const rightVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };
  
  return (
    <section id="experience" className="w-full py-16 md:py-24 bg-card">
      <div ref={ref} className="container">
        <h2 className="text-3xl font-bold text-center mb-16 font-headline">{t.experience.title}</h2>
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-border hidden md:block" />
          {t.experience.jobs.map((job, index) => (
            <div key={index} className="relative md:mb-12 mb-8">
              <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-background p-2 rounded-full border-2 border-primary items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div className="grid md:grid-cols-2 gap-x-12">
                {index % 2 === 0 ? (
                  <motion.div
                    className="md:text-right"
                    variants={leftVariants}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                  >
                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 md:ml-auto">
                      <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground mb-2">{job.period}</p>
                        <h3 className="text-xl font-bold">{job.role}</h3>
                        <p className="text-primary font-semibold mb-3">{job.company}</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2 text-left md:text-right">
                          {job.responsibilities.map((resp, i) => <li key={i}>{resp}</li>)}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <div />
                )}
                {index % 2 !== 0 ? (
                   <motion.div
                    className="md:text-left"
                    variants={rightVariants}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                  >
                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                       <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground mb-2">{job.period}</p>
                        <h3 className="text-xl font-bold">{job.role}</h3>
                        <p className="text-primary font-semibold mb-3">{job.company}</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                          {job.responsibilities.map((resp, i) => <li key={i}>{resp}</li>)}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <div className="hidden md:block"/>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
