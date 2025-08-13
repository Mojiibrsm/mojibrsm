
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

      // Use local translations as a base
      const baseEn = translations.en as any;
      const baseBn = translations.bn as any;

      for (const section in baseEn) {
          if (contentData[section] && contentData[section].en) {
              enContent[section] = contentData[section].en;
          } else {
              enContent[section] = baseEn[section];
          }
           if (contentData[section] && contentData[section].bn) {
              bnContent[section] = contentData[section].bn;
          } else {
              bnContent[section] = baseBn[section];
          }
      }

      const newAllContent = { en: enContent as Content, bn: bnContent as Content };
      setAllContent(newAllContent);
      setIsLoading(false); // Set loading to false only after data processing is complete

    }, (error) => {
      console.error("Error fetching content from Firestore, falling back to local data:", error);
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
