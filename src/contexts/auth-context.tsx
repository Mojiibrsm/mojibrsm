
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Static user data to avoid breaking components that use it.
const staticUser = {
  uid: 'static-user-id',
  displayName: 'Admin User',
  email: 'admin@example.com',
  photoURL: 'https://placehold.co/100x100.png',
  phoneNumber: '+123456789',
  role: 'Admin' as const,
};

interface AuthContextType {
  isLoggedIn: boolean;
  user: typeof staticUser | null;
  login: (password: string) => boolean;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Use an environment variable for the password. The NEXT_PUBLIC_ prefix makes it available on the client-side.
// Provide a fallback for local development.
const LOGIN_PASSWORD = process.env.NEXT_PUBLIC_LOGIN_PASSWORD || 'mojibx'; 

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for login state in localStorage on initial load
    const loggedInState = localStorage.getItem('isLoggedIn');
    if (loggedInState === 'true') {
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const login = (password: string): boolean => {
    if (!LOGIN_PASSWORD) {
      console.error("Login password is not set in environment variables.");
      return false;
    }
    if (password === LOGIN_PASSWORD) {
      localStorage.setItem('isLoggedIn', 'true');
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    router.push('/login');
  };

  const value = {
    isLoggedIn,
    user: isLoggedIn ? staticUser : null,
    login,
    logout,
    loading,
  };

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
