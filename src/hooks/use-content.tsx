'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/services/firestore';
import { collection, onSnapshot } from 'firebase/firestore';

export type Content = {
    about: any;
    blog: any;
    contact: any;
    experience: any;
    footer: any;
    gallery: any;
    hero: any;
    nav: any;
    portfolio: any;
    pricing: any;
    services: any;
    site: any;
    skills: any;
    stats: any;
    whatsapp: any;
};

// This type will hold all languages for the content.
type AllContent = {
    en: Content | null;
    bn: Content | null;
};

interface ContentContextType {
  allContent: AllContent;
  isLoading: boolean;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const [allContent, setAllContent] = useState<AllContent>({ en: null, bn: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const contentRef = collection(db, 'content');
    const unsubscribe = onSnapshot(contentRef, (snapshot) => {
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
