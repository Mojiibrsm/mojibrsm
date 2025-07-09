import { MetadataRoute } from 'next'
import { translations } from '@/lib/translations'
 
export default function robots(): MetadataRoute.Robots {
  const baseUrl = translations.en.site.url;
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/dashboard/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
