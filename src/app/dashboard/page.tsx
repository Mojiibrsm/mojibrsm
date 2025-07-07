'use client';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    if (loading || !user) {
        return (
             <div className="flex items-center justify-center h-screen bg-background text-foreground">
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold">Welcome, {user.displayName || user.email}</h1>
                    <p className="text-muted-foreground">You are now logged in to your dashboard.</p>
                     <Button onClick={handleLogout}>Logout</Button>
                </div>
            </main>
            <Footer />
        </div>
    );
}
