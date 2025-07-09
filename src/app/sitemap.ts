import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.mojib.oftern.com'
 
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
