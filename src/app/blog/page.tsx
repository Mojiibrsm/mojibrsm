'use client';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function BlogPage() {
    const { t } = useLanguage();

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    };

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow">
                <section id="blog-list" className="w-full py-16 md:py-24">
                    <div className="container">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.5 }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-4xl font-bold font-headline">{t.blog.title}</h2>
                            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">{t.blog.description}</p>
                        </motion.div>
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {t.blog.posts.map((post) => (
                                <motion.div key={post.title} variants={itemVariants} className="h-full">
                                    <Card className="relative overflow-hidden shadow-lg hover:shadow-primary/20 transition-all duration-300 rounded-2xl flex flex-col bg-card h-full">
                                        <div className="relative overflow-hidden rounded-t-2xl">
                                          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                                            <Image
                                                src={post.image}
                                                alt={post.title}
                                                width={600}
                                                height={400}
                                                className="w-full h-auto object-cover"
                                                data-ai-hint={post.imageHint}
                                            />
                                          </motion.div>
                                        </div>
                                        <div className='relative bg-card rounded-b-2xl flex flex-col flex-grow p-6'>
                                            <p className="text-sm text-muted-foreground mb-2">{post.date}</p>
                                            <CardTitle className="mb-2 text-xl">{post.title}</CardTitle>
                                            <CardDescription className="flex-grow mb-4">{post.excerpt}</CardDescription>
                                            <Button asChild className="w-full mt-auto">
                                                <Link href={post.link}>
                                                    {t.blog.readMore}
                                                </Link>
                                            </Button>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
