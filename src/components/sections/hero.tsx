'use client';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Hero() {
  const { t } = useLanguage();

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


  return (
    <section className="w-full py-24 md:py-32 lg:py-40 bg-background">
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
                className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline"
              >
                {t.hero.greeting} <span className="text-primary">{t.hero.name}</span>
              </motion.h1>
              <motion.h2 
                variants={itemVariants}
                className="text-2xl font-semibold text-foreground/90 sm:text-3xl font-headline"
              >
                {t.hero.title}
              </motion.h2>
              <motion.p 
                variants={itemVariants}
                className="max-w-[600px] text-muted-foreground md:text-xl"
              >
                {t.hero.tagline}
              </motion.p>
            </div>
            <motion.div variants={itemVariants} className="flex flex-col gap-3 min-[400px]:flex-row">
              <Button size="lg" asChild>
                <a href="/mojib-rsm-cv.pdf" target="_blank" rel="noopener noreferrer">
                  {t.hero.buttons.cv}
                </a>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <a href="#portfolio">
                  {t.hero.buttons.work}
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#contact">
                  {t.hero.buttons.contact}
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
            <div className="absolute w-full h-full max-w-xs bg-gradient-to-br from-primary via-accent to-secondary/30 rounded-full blur-3xl animate-pulse"></div>
            <Image
              src="https://placehold.co/600x600.png"
              alt={t.hero.name}
              width={600}
              height={600}
              className="relative mx-auto rounded-full object-cover aspect-square w-full max-w-sm shadow-2xl"
              data-ai-hint="man portrait"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
