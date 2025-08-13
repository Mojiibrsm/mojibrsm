
'use client';
import { Award, Briefcase, Loader2 } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useContent } from '@/hooks/use-content';

const icons = [Award, Briefcase];

export default function Stats() {
  const { content, isLoading } = useContent();
  const t = content?.stats;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };
  
  if (isLoading) {
    return (
        <section id="stats" className="w-full py-16 md:py-24 bg-background flex justify-center items-center min-h-[20vh]">
            <Loader2 className="w-8 h-8 animate-spin" />
        </section>
    );
  }
  
  if (!t) return null;

  return (
    <section id="stats" className="w-full py-16 md:py-24 bg-background" suppressHydrationWarning>
      <motion.div
        ref={ref}
        className="container"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {t.items.map((stat, index) => {
            const Icon = icons[index % icons.length];
            return (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="relative overflow-hidden rounded-xl bg-card p-6 shadow-lg border border-transparent hover:border-primary transition-all duration-300 group"
              >
                <div className="absolute -inset-px bg-gradient-to-r from-accent to-primary rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
                <div className="relative flex items-center gap-6">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Icon className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <p className="text-4xl font-extrabold text-foreground">{stat.value}</p>
                    <p className="text-lg text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
