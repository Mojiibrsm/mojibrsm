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
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider = ({ children }: { children: React.Node }) => {
  // Initialize with local translations. This ensures the site is never blank.
  const [allContent, setAllContent] = useState<AllContent>(translations);

  useEffect(() => {
    const contentRef = collection(db, 'content');
    
    // Subscribe to real-time updates from Firestore.
    const unsubscribe = onSnapshot(contentRef, (snapshot) => {
      if (snapshot.empty) {
        // If Firestore is empty, we just stick with local translations.
        console.warn("Firestore 'content' collection is empty. Using local fallback data.");
        return;
      }

      const firestoreData: Record<string, { en: any; bn: any }> = {};
      snapshot.forEach((doc) => {
        firestoreData[doc.id] = doc.data() as { en: any; bn: any };
      });
      
      const enContent: any = {};
      const bnContent: any = {};

      const baseEn = translations.en as any;
      const baseBn = translations.bn as any;

      // Merge Firestore data with local fallbacks. This creates a complete content object.
      for (const section in baseEn) {
          enContent[section] = firestoreData[section]?.en ?? baseEn[section];
          bnContent[section] = firestoreData[section]?.bn ?? baseBn[section];
      }

      const newAllContent = { en: enContent as Content, bn: bnContent as Content };
      setAllContent(newAllContent);

    }, (error) => {
      console.error("Error fetching content from Firestore, using local data:", error);
      // In case of an error, the provider will continue to use the initial local translations.
    });

    // Unsubscribe from the listener when the component unmounts.
    return () => unsubscribe();
  }, []);

  const value = {
    allContent,
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
