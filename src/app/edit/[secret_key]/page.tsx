
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page's functionality has been moved to the admin dashboard
// under the "Content" section. It now simply redirects to the admin login.
export default function EditPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login?redirectTo=/admin/content');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p>Redirecting to the new content editor...</p>
    </div>
  );
}
