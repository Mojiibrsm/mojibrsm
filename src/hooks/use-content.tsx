
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

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const [allContent, setAllContent] = useState<AllContent>(translations);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const contentRef = collection(db, 'content');
    const unsubscribe = onSnapshot(contentRef, (snapshot) => {
      if (snapshot.empty) {
        // If Firestore is empty, use local translations and stop loading.
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

      for (const section in translations.en) {
        if (contentData[section]) {
            enContent[section] = contentData[section].en;
            bnContent[section] = contentData[section].bn;
        } else {
            // Fallback to local translation if section not in firestore
            enContent[section] = (translations.en as any)[section];
            bnContent[section] = (translations.bn as any)[section];
        }
      }

      const newAllContent = { en: enContent as Content, bn: bnContent as Content };
      setAllContent(newAllContent);
      setIsLoading(false);

    }, (error) => {
      console.error("Error fetching content from Firestore:", error);
      // On error, we will stick with the initial local translations.
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
