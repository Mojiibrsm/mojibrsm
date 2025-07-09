import { MetadataRoute } from 'next'
import { translations } from '@/lib/translations'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = translations.en.site.url
 
  // In a real app with a CMS, you would fetch dynamic routes (like blog posts)
  // from your data source and add them to the sitemap.
  const staticRoutes = [
    { url: '/', priority: 1.0, changeFrequency: 'monthly' as const },
    { url: '/blog', priority: 0.7, changeFrequency: 'weekly' as const },
  ];
 
  const urls = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
 
  return urls;
}
