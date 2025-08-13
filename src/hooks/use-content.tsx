
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
  // Initialize with local fallback data to prevent blank pages
  const [allContent, setAllContent] = useState<AllContent>(translations);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const contentRef = collection(db, 'content');
    const unsubscribe = onSnapshot(contentRef, (snapshot) => {
      if (snapshot.empty) {
        // If Firestore is empty, continue using local translations and stop loading.
        setIsLoading(false);
        return;
      }

      const contentData: Record<string, { en: any; bn: any }> = {};
      snapshot.forEach((doc) => {
        contentData[doc.id] = doc.data() as { en: any; bn: any };
      });
      
      const enContent: any = {};
      const bnContent: any = {};

      for (const section in contentData) {
          if (contentData[section]) {
              enContent[section] = contentData[section].en;
              bnContent[section] = contentData[section].bn;
          }
      }

      setAllContent({ en: enContent as Content, bn: bnContent as Content });
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching content from Firestore:", error);
      // If there's an error, stick with the local fallback data.
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
