'use client';

import { translations } from '@/lib/translations';
import { notFound } from 'next/navigation';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import BlogPostContent from '@/components/blog-post-content';
import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { slug: string };
};

// Generate metadata for the page
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug;
  // We don't know the language here, so we have to check both.
  // Assume English as the primary source for metadata if available, otherwise Bengali.
  const post = translations.en.blog.posts.find((p) => p.slug === slug) || translations.bn.blog.posts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  // To get the site title, we need to decide on a language. Let's stick with English for metadata.
  const siteConfig = {
    name: translations.en.site.title,
    url: translations.en.site.url,
  }

  return {
    title: `${post.metaTitle} | ${siteConfig.name}`,
    description: post.metaDescription,
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url: `${siteConfig.url}/blog/${slug}`,
      images: [
        {
          url: post.image,
          width: 1200,
          height: 600,
          alt: post.title,
        },
      ],
    },
    twitter: {
       card: 'summary_large_image',
       title: post.metaTitle,
       description: post.metaDescription,
       images: [post.image],
    }
  };
}


// The main page component
export default function BlogPostPage({ params }: Props) {
    // We need to check if post exists on server, to call notFound() if needed.
    const postExists = translations.en.blog.posts.some(p => p.slug === params.slug) || translations.bn.blog.posts.some(p => p.slug === params.slug);

    if(!postExists) {
        notFound();
    }

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
  // Remove duplicates
  const uniqueSlugs = Array.from(new Set(allPosts.map(p => p.slug))).map(slug => ({ slug }));
  
  return uniqueSlugs;
}