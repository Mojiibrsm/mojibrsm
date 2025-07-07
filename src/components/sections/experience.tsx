'use client';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function Experience() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };
  
  return (
    <section id="experience" className="w-full py-16 md:py-24 bg-card">
      <div className="container">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-center mb-16 font-headline">{t.experience.title}</motion.h2>
        <motion.div
          ref={ref}
          className="relative max-w-3xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <div className="absolute left-0 md:left-4 top-0 h-full w-0.5 bg-border/50" />
          {t.experience.jobs.map((job, index) => (
            <motion.div key={index} className="relative pl-8 md:pl-16 mb-12" variants={itemVariants}>
              <div className="absolute top-1 -left-1.5 md:left-2 bg-background p-2 rounded-full border-2 border-accent flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-accent" />
              </div>
              <Card className="shadow-lg hover:shadow-accent/10 transition-shadow duration-300 border-l-4 border-accent">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <CardTitle className="text-xl font-bold">{job.role}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 sm:mt-0">{job.period}</p>
                  </div>
                  <p className="text-primary font-semibold text-lg">{job.company}</p>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    {job.responsibilities.map((resp, i) => <li key={i}>{resp}</li>)}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
