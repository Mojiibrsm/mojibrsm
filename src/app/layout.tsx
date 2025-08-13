
import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { Poppins } from 'next/font/google';
import { LanguageProvider } from '@/contexts/language-context';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { ClientOnly } from '@/components/client-only';
import { translations } from '@/lib/translations';
import { ContentProvider } from '@/hooks/use-content';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
});

// Metadata remains based on local files for fast initial load and SEO.
const siteConfig = {
  name: translations.en.site.title,
  description: translations.en.hero.tagline,
  url: translations.en.site.url,
  ogImage: translations.en.site.adminAvatar, 
  favicon: translations.en.site.favicon,
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Portfolio`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  
  icons: {
    icon: siteConfig.favicon || '/favicon.ico',
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 500,
        height: 500,
        alt: siteConfig.name,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} !scroll-smooth`} suppressHydrationWarning>
      <body className="font-body antialiased bg-background text-foreground overflow-x-hidden" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <AuthProvider>
              <ContentProvider>
                {children}
              </ContentProvider>
            </AuthProvider>
            <ClientOnly>
              <Toaster />
            </ClientOnly>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
