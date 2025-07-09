
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
      const refreshedUser = auth.currentUser;
      // The onAuthStateChanged listener will handle the update
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, now get Firestore data
        const userRef = doc(db, 'users', firebaseUser.uid);
        const unsubFirestore = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const firestoreData = doc.data() as FirestoreUser;
            setUser({ ...firebaseUser, ...firestoreData });
          } else {
            // This case might happen briefly if the user doc hasn't been created yet
            setUser(null);
          }
           setLoading(false);
        });
        
        return () => unsubFirestore();

      } else {
        // User is signed out
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = { user, loading, reloadUser };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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
