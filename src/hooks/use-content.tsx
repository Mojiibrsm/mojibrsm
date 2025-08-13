
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/services/firestore';
import { collection, onSnapshot } from 'firebase/firestore';
import { translations } from '@/lib/translations';
import { en } from '@/lib/translations/en';

export type Content = typeof en;

// This type will hold all languages for the content.
type AllContent = {
    en: Content;
    bn: Content;
};

interface ContentContextType {
  allContent: AllContent;
  isLoading: boolean;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize with local translations to prevent empty state on initial render.
  const [allContent, setAllContent] = useState<AllContent>(translations);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const contentRef = collection(db, 'content');
    const unsubscribe = onSnapshot(contentRef, (snapshot) => {
      if (snapshot.empty) {
        // If Firestore is empty, we stick with local translations.
        console.warn("Firestore 'content' collection is empty. Using local fallback data.");
        setAllContent(translations);
        setIsLoading(false);
        return;
      }

      const contentData: Record<string, { en: any; bn: any }> = {};
      snapshot.forEach((doc) => {
        contentData[doc.id] = doc.data() as { en: any; bn: any };
      });
      
      const enContent: any = {};
      const bnContent: any = {};

      const baseEn = translations.en as any;
      const baseBn = translations.bn as any;

      // Merge Firestore data with local fallbacks. This ensures no section is missing.
      for (const section in baseEn) {
          enContent[section] = contentData[section]?.en ?? baseEn[section];
          bnContent[section] = contentData[section]?.bn ?? baseBn[section];
      }

      const newAllContent = { en: enContent as Content, bn: bnContent as Content };
      setAllContent(newAllContent);
      setIsLoading(false);

    }, (error) => {
      console.error("Error fetching content from Firestore, using local data:", error);
      // On error, we will use the initial local translations.
      setAllContent(translations);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    allContent,
    isLoading,
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
