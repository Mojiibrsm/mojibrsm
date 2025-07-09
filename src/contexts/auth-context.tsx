
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, DocumentData } from 'firebase/firestore';
import type { FirestoreUser } from '@/services/firestore';

interface AuthContextType {
  user: (User & FirestoreUser) | null;
  loading: boolean;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<(User & FirestoreUser) | null>(null);
  const [loading, setLoading] = useState(true);

  const reloadUser = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      await currentUser.reload();
      // The onAuthStateChanged listener will handle the update
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is authenticated, listen for Firestore document
        const userRef = doc(db, 'users', firebaseUser.uid);
        const unsubFirestore = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const firestoreData = doc.data() as FirestoreUser;
            setUser({ ...firebaseUser, ...firestoreData });
            setLoading(false);
          }
          // If doc doesn't exist yet (e.g., right after signup),
          // we wait. `loading` remains true, preventing premature redirects.
          // The listener will fire again once the document is created.
        });
        
        return () => unsubFirestore();

      } else {
        // User is not authenticated, clear user state and stop loading
        setUser(null);
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value = { user, loading, reloadUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
