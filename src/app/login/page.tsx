
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { ClientOnly } from '@/components/client-only';
import { useAuth } from '@/contexts/auth-context';

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const wasSuccessful = login(password);

    if (wasSuccessful) {
      toast({
        title: 'লগইন সফল',
        description: "আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে।",
      });
      const redirectTo = searchParams.get('redirectTo') || '/admin';
      router.push(redirectTo);
    } else {
      toast({
        variant: 'destructive',
        title: 'লগইন ব্যর্থ',
        description: 'আপনি ভুল পাসওয়ার্ড দিয়েছেন। অনুগ্রহ করে আবার চেষ্টা করুন।',
      });
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <ClientOnly>
        <Header />
      </ClientOnly>
      <main className="flex-grow flex items-center justify-center bg-muted/40 py-12">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle>স্বাগতম!</CardTitle>
            <CardDescription>আপনার পাসওয়ার্ড দিয়ে লগইন করুন।</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="password">পাসওয়ার্ড</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="পাসওয়ার্ড লিখুন"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                লগইন করুন
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <ClientOnly>
        <Footer />
      </ClientOnly>
    </div>
  );
}
