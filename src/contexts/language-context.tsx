'use client';
import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { Translations } from '@/lib/translations';
import { translations } from '@/lib/translations';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translations[Language];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const CONTENT_DOC_ID = 'live-content';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [content, setContent] = useState<Translations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const docRef = doc(db, "content", CONTENT_DOC_ID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setContent(docSnap.data() as Translations);
        } else {
          // If content doesn't exist in DB, use local and don't seed automatically.
          // Seeding should happen from the edit page to avoid race conditions.
          setContent(translations);
        }
      } catch (error) {
        console.error("Failed to load content from Firestore, using local fallback.", error);
        setContent(translations); // Fallback to local translations on error
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);
  
  // Use fetched content if available, otherwise fallback to static translations
  const t = content ? content[language] : translations[language];

  if (loading) {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-background">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
