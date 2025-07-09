
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { updateUserRole } from '@/services/firestore';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ShieldCheck, ShieldX } from 'lucide-react';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { ClientOnly } from '@/components/client-only';
import { CardDescription, CardTitle } from '@/components/ui/card';

const SECRET_KEY = 'mojibx';

export default function MakeAdminPage({ params }: { params: { secret_key: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'unauthorized' | 'no_user'>('loading');
  const [message, setMessage] = useState('Verifying credentials and updating your role.');

  useEffect(() => {
    if (loading) {
      return;
    }

    if (params.secret_key !== SECRET_KEY) {
      setStatus('unauthorized');
      setMessage('The secret key provided is incorrect.');
      return;
    }

    if (!user) {
      setStatus('no_user');
      setMessage('You must be logged in to be granted admin rights.');
      return;
    }

    if (user.role === 'Admin') {
        setStatus('success');
        setMessage('You are already an admin. Redirecting...');
        setTimeout(() => router.push('/admin'), 2000);
        return;
    }

    const grantAdminRole = async () => {
      try {
        await updateUserRole(user.uid, 'Admin');
        setStatus('success');
        setMessage('You have been granted Admin access. Redirecting...');
        // Redirect to admin dashboard after a short delay to allow context to update
        setTimeout(() => router.push('/admin'), 2000);
      } catch (err) {
        console.error(err);
        setMessage('Failed to update role in the database.');
        setStatus('error');
      }
    };

    grantAdminRole();

  }, [user, loading, params.secret_key, router]);

  const StatusDisplay = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-12 w-12 animate-spin text-primary" />;
      case 'success':
        return <ShieldCheck className="h-12 w-12 text-green-500" />;
      case 'no_user':
      case 'unauthorized':
      case 'error':
        return <ShieldX className="h-12 w-12 text-destructive" />;
      default:
        return null;
    }
  }


  return (
    <div className="flex flex-col min-h-screen">
      <ClientOnly>
        <Header />
      </ClientOnly>
      <main className="flex-grow flex items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
            <CardContent className="p-8 flex flex-col items-center text-center">
                <StatusDisplay />
                <CardTitle className="mt-4 text-2xl">{status.charAt(0).toUpperCase() + status.slice(1)}</CardTitle>
                <CardDescription className="mt-2">{message}</CardDescription>
                {status === 'no_user' && (
                     <a href="/login" className="mt-4 text-sm underline text-primary">Click here to log in</a>
                )}
            </CardContent>
        </Card>
      </main>
      <ClientOnly>
        <Footer />
      </ClientOnly>
    </div>
  );
}
