
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

// This page is for creating the initial admin user if one doesn't exist.
// With Firebase, user creation should be done securely in the Firebase console.
export default function SignupPageRedirect() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
     if (!loading) {
        // If there's already a user or we are not in a setup phase, redirect.
        router.replace('/login');
     }
  }, [router, user, loading]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/40 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Admin User Setup</h1>
        <p className="text-muted-foreground mt-2">
            To create an admin user, please go to your Firebase project console,
            <br />
            navigate to the Authentication section, and add a new user.
        </p>
         <p className="text-sm text-muted-foreground mt-4">
            Redirecting to login...
        </p>
      </div>
    </div>
  );
}
