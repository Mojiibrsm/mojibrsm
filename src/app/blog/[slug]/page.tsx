
'use client';

import { translations } from '@/lib/translations';
import { notFound } from 'next/navigation';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { useLanguage } from '@/contexts/language-context';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import type { Metadata } from 'next';
import { useEffect, useState } from 'react';

type Props = {
  params: { slug: string };
};

// This component handles the actual rendering and uses client-side hooks.
function BlogPostContent({ slug }: { slug: string }) {
    const { language } = useLanguage();
    const [post, setPost] = useState<typeof translations.en.blog.posts[0] | undefined>(undefined);
    const [metadata, setMetadata] = useState<Metadata>({});

    useEffect(() => {
        const currentPost = translations[language].blog.posts.find((p) => p.slug === slug);
        // Fallback to English if not found in current language
        const fallbackPost = translations.en.blog.posts.find((p) => p.slug === slug);
        const finalPost = currentPost || fallbackPost;
        
        if (finalPost) {
            setPost(finalPost);
            
            // Set metadata dynamically
            const newMeta: Metadata = {
                title: finalPost.metaTitle,
                description: finalPost.metaDescription,
            };

            if (JSON.stringify(newMeta) !== JSON.stringify(metadata)) {
                document.title = newMeta.title as string;
                const descMeta = document.querySelector('meta[name="description"]');
                if (descMeta) {
                    descMeta.setAttribute('content', newMeta.description as string);
                }
                setMetadata(newMeta);
            }
        } else {
            notFound();
        }
    }, [slug, language, metadata]);

    if (!post) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <p>Loading post...</p>
            </div>
        );
    }
    
    return (
        <article className="container py-12 md:py-20">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 text-center">
                    <p className="text-sm text-muted-foreground mb-2">{post.date}</p>
                    <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">{post.title}</h1>
                    <div className="flex justify-center flex-wrap gap-2">
                        {post.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                    </div>
                </header>

                <Image
                    src={post.image}
                    alt={post.title}
                    width={1200}
                    height={600}
                    className="w-full h-auto object-cover rounded-2xl shadow-lg mb-8"
                    data-ai-hint={post.imageHint}
                    priority
                />

                <div className="prose prose-lg dark:prose-invert max-w-full mx-auto"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
            </div>
        </article>
    );
}

// The main page component
export default function BlogPostPage({ params }: Props) {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow">
                <BlogPostContent slug={params.slug} />
            </main>
            <Footer />
        </div>
    );
}

// Statically generate routes for all slugs from all languages to improve SEO
export async function generateStaticParams() {
  const enPosts = translations.en.blog.posts.map((post) => ({ slug: post.slug }));
  const bnPosts = translations.bn.blog.posts.map((post) => ({ slug: post.slug }));
  
  const allPosts = [...enPosts, ...bnPosts];
  const uniqueSlugs = Array.from(new Set(allPosts.map(p => p.slug))).map(slug => ({ slug }));
  
  return uniqueSlugs;
}
