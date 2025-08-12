
'use client';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { getBlogPosts } from '../admin/blog/actions';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

type Post = {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    image: string;
    imageHint: string;
    date: string;
    tags: string[];
    metaTitle: string;
    metaDescription: string;
};

interface BlogContent {
  title: string;
  description: string;
  viewAll: string;
  readMore: string;
  posts: Post[];
}


export default function BlogPage() {
    const { language } = useLanguage();
    const [blogContent, setBlogContent] = useState<BlogContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setIsLoading(true);
                const data = await getBlogPosts();
                setBlogContent(data[language]);
            } catch (error) {
                console.error("Failed to fetch blog posts:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPosts();
    }, [language]);


    const containerVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    };
    
    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen bg-background text-foreground">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin"/>
                </main>
                <Footer />
            </div>
        )
    }
    
    if (!blogContent) {
         return (
            <div className="flex flex-col min-h-screen bg-background text-foreground">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <p>Could not load blog posts.</p>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow">
                <section id="blog-list" className="w-full py-16 md:py-24 bg-card">
                    <div className="container">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.5 }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-4xl font-bold font-headline">{blogContent.title}</h2>
                            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">{blogContent.description}</p>
                        </motion.div>
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {blogContent.posts.map((post) => (
                                <motion.div key={post.slug} variants={itemVariants} className="h-full">
                                    <Link href={`/blog/${post.slug}`} className="block h-full group">
                                        <Card className="relative overflow-hidden shadow-lg group-hover:shadow-primary/20 transition-all duration-300 rounded-2xl flex flex-col bg-card h-full">
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
                                                    <span>{blogContent.readMore}</span>
                                                </Button>
                                            </div>
                                        </Card>
                                    </Link>
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
