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
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <section id="experience" className="w-full py-16 md:py-24 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold font-headline">{t.experience.title}</h2>
          <div className="mt-4 h-1.5 w-24 bg-gradient-to-r from-primary via-accent to-secondary mx-auto rounded-full"></div>
        </motion.div>
        
        <motion.div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {t.experience.jobs.map((job, index) => (
            <motion.div key={index} variants={itemVariants} className="h-full">
              <Card className="w-full bg-card p-6 rounded-2xl shadow-lg hover:shadow-primary/20 transition-all duration-300 border-l-4 border-primary h-full">
                  <div className="flex items-center mb-4">
                      <Briefcase className="w-8 h-8 text-primary mr-4 flex-shrink-0" />
                      <div>
                          <h3 className="text-2xl font-bold text-foreground">{job.role}</h3>
                          <p className="text-lg font-semibold text-primary">{job.company}</p>
                      </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 font-mono">{job.period}</p>
                  <ul className="space-y-2 text-muted-foreground list-disc list-inside pl-2">
                      {job.responsibilities.map((resp, i) => (
                          <li key={i}>{resp}</li>
                      ))}
                  </ul>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
