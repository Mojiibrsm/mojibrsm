
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, DocumentData } from 'firebase/firestore';
import type { FirestoreUser } from '@/services/firestore';

interface AuthContextType {
  user: (User & Partial<FirestoreUser>) | null;
  loading: boolean;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<(User & Partial<FirestoreUser>) | null>(null);
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
        const userRef = doc(db, 'users', firebaseUser.uid);
        const unsubFirestore = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const firestoreData = snapshot.data() as FirestoreUser;
            setUser({ ...firebaseUser, ...firestoreData });
            setLoading(false);
          } else {
            // This is a transient state during signup where the user is created in Auth
            // but the corresponding Firestore document isn't yet.
            // We keep loading as true and wait for the document to be created,
            // which will trigger this onSnapshot listener again.
          }
        }, (error) => {
            console.error("Auth context Firestore error:", error);
            setUser(null);
            setLoading(false);
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
