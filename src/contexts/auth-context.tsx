
'use client';

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { LanguageProvider } from './language-context';
import type { FirestoreUser } from '@/services/firestore';
import { getUserDoc } from '@/services/firestore';
import type { Unsubscribe } from 'firebase/firestore';


interface AuthContextType {
  user: User | null;
  firestoreUser: FirestoreUser | null;
  loading: boolean;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firestoreUser: null,
  loading: true,
  reloadUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firestoreUser, setFirestoreUser] = useState<FirestoreUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeFirestore: Unsubscribe | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      
      unsubscribeFirestore?.();

      if (authUser) {
        unsubscribeFirestore = getUserDoc(authUser.uid, (fsUser) => {
          setFirestoreUser(fsUser);
          setLoading(false);
        });
      } else {
        setFirestoreUser(null);
        setLoading(false);
      }
    });

    return () => {
        unsubscribeAuth();
        unsubscribeFirestore?.();
    };
  }, []);

  const reloadUser = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      await currentUser.reload();
      const refreshedUser = auth.currentUser;
      setUser(refreshedUser);
    }
  };

  const value = { user, firestoreUser, loading, reloadUser };

  return (
    <AuthContext.Provider value={value}>
        <LanguageProvider>
            {children}
        </LanguageProvider>
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
