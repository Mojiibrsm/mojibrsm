
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { db } from '@/services/firestore';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { useLanguage } from '@/contexts/language-context';

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

interface ContentContextType {
  content: Content | null;
  isLoading: boolean;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const { language } = useLanguage();
  const [allContent, setAllContent] = useState<Record<string, { en: any; bn: any }>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const contentRef = collection(db, 'content');
    const unsubscribe = onSnapshot(contentRef, (snapshot) => {
      const contentData: Record<string, { en: any; bn: any }> = {};
      snapshot.forEach((doc) => {
        contentData[doc.id] = doc.data() as { en: any; bn: any };
      });
      setAllContent(contentData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching content from Firestore:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const contentForLanguage = useMemo(() => {
    if (isLoading || Object.keys(allContent).length === 0) {
      return null;
    }
    const selectedContent: any = {};
    for (const section in allContent) {
      if (allContent[section] && allContent[section][language]) {
        selectedContent[section] = allContent[section][language];
      } else if (allContent[section] && allContent[section]['en']) {
        // Fallback to English if the selected language is not available
        selectedContent[section] = allContent[section]['en'];
      }
    }
    return selectedContent as Content;
  }, [allContent, language, isLoading]);


  const value = {
    content: contentForLanguage,
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
