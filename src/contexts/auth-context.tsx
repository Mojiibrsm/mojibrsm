'use client';

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { LanguageProvider } from './language-context';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = { user, loading };

  return (
    <AuthContext.Provider value={value}>
        <LanguageProvider>
            {loading ? (
                 <div className="flex items-center justify-center h-screen bg-background">
                    <div className="flex flex-col items-center space-y-4">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <Skeleton className="h-8 w-48" />
                    </div>
                 </div>
            ) : (
              children
            )}
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
