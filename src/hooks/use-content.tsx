
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

const CONTENT_CACHE_KEY = 'contentCache';

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const [allContent, setAllContent] = useState<AllContent>(() => {
    // Try to load from cache on initial render
    try {
        const cachedData = localStorage.getItem(CONTENT_CACHE_KEY);
        if (cachedData) {
            return JSON.parse(cachedData);
        }
    } catch (error) {
        console.error("Failed to read content from localStorage", error);
    }
    // Fallback to local translations if cache is empty or invalid
    return translations;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
     // If we have cached data, we can consider the initial load "done"
     const cachedData = localStorage.getItem(CONTENT_CACHE_KEY);
     if(cachedData) {
         setIsLoading(false);
     }

    const contentRef = collection(db, 'content');
    const unsubscribe = onSnapshot(contentRef, (snapshot) => {
      if (snapshot.empty) {
        // If Firestore is empty, use local translations and stop loading.
        setAllContent(translations);
        localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(translations));
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

      const newAllContent = { en: enContent as Content, bn: bnContent as Content };
      setAllContent(newAllContent);

      try {
        // Update the cache with the fresh data from Firestore
        localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(newAllContent));
      } catch (error) {
          console.error("Failed to write content to localStorage", error);
      }
      
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching content from Firestore:", error);
      // If there's an error, stick with the current (cached or fallback) data.
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
