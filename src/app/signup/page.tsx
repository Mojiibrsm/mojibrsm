
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is no longer needed with the simple password login.
// It now simply redirects to the login page.
export default function SignupPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p>Redirecting to login...</p>
    </div>
  );
}
