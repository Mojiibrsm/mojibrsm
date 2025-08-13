'use client';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useContent } from '@/hooks/use-content';
import { useLanguage } from '@/contexts/language-context';

export default function Hero() {
  const { allContent } = useContent();
  const { language } = useLanguage();
  const t = allContent[language]?.hero;

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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.5 } },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, delay: 0.4 } },
  };
  
  if (!t) return null;

  return (
    <section className="w-full py-16 md:py-20 lg:py-24 bg-card" suppressHydrationWarning>
      <div className="container px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          <motion.div 
            className="flex flex-col justify-center space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="space-y-4">
              <motion.h1 
                variants={itemVariants}
                className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline animate-float"
              >
                {t.greeting}{' '}
                <span className="text-primary relative inline-block">
                    {t.name}
                    <svg
                        className="absolute -bottom-3 left-0 w-full h-auto text-accent animate-wavy-underline"
                        viewBox="0 0 120 8"
                        preserveAspectRatio="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M0 5 C 20 0, 40 10, 60 5 S 100 0, 120 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                    </svg>
                </span>
              </motion.h1>
              <motion.h2 
                variants={itemVariants}
                className="text-2xl font-semibold text-foreground/90 sm:text-3xl font-headline"
              >
                {t.title}
              </motion.h2>
              <motion.p 
                variants={itemVariants}
                className="max-w-[600px] text-muted-foreground md:text-xl"
              >
                {t.tagline}
              </motion.p>
            </div>
            <motion.div variants={itemVariants} className="flex flex-col gap-3 min-[400px]:flex-row">
              <Button size="lg" asChild>
                <a href={t.cv_url} target="_blank" rel="noopener noreferrer">
                  {t.buttons.cv}
                </a>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <a href="#portfolio">
                  {t.buttons.work}
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#contact">
                  {t.buttons.contact}
                </a>
              </Button>
            </motion.div>
          </motion.div>
          <motion.div 
             variants={imageVariants}
             initial="hidden"
             animate="visible"
            className="relative flex justify-center items-center"
          >
            <div className="absolute w-full h-full max-w-sm bg-gradient-to-br from-primary via-accent to-secondary rounded-full blur-2xl animate-spin-slow opacity-75"></div>
            <motion.div 
              className="relative mx-auto w-full max-w-sm rounded-full overflow-hidden shadow-2xl border-4 border-background/20"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Image
                src={t.image}
                alt={t.name}
                width={600}
                height={600}
                className="object-cover aspect-square w-full"
                data-ai-hint={t.imageHint}
                priority
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
