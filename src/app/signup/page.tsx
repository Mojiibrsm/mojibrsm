
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Phone, KeyRound } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber, setPersistence, browserSessionPersistence, browserLocalPersistence, type ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { addUserToFirestore } from '@/services/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { ClientOnly } from '@/components/client-only';

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
    confirmationResult: ConfirmationResult;
  }
}

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {},
      });
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);

    if (!/^\+[1-9]\d{1,14}$/.test(phoneNumber)) {
      toast({
        variant: 'destructive',
        title: 'অবৈধ ফোন নম্বর',
        description: 'অনুগ্রহ করে দেশের কোড সহ একটি সঠিক ফোন নম্বর লিখুন (যেমন: +8801...)।',
      });
      setLoading(false);
      return;
    }

    try {
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);
      const verifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      window.confirmationResult = confirmationResult;
      setOtpSent(true);
      setResendCooldown(30); // Start 30s cooldown
      toast({
        title: 'OTP পাঠানো হয়েছে',
        description: `আপনার ${phoneNumber} নম্বরে একটি OTP পাঠানো হয়েছে।`,
      });
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      let description = 'একটি সমস্যা হয়েছে। অনুগ্রহ করে আপনার নম্বরটি পরীক্ষা করুন।';
      if (error.code === 'auth/too-many-requests') {
        description = 'অনেকবার চেষ্টা করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।';
      } else if (error.code === 'auth/network-request-failed') {
        description = 'নেটওয়ার্ক অনুরোধ ব্যর্থ হয়েছে। আপনার ডেভেলপমেন্ট ডোমেইনটি Firebase কনসোলে অনুমোদিত আছে কিনা তা পরীক্ষা করুন।';
      } else if (error.code === 'auth/billing-not-enabled') {
        description = 'এই প্রকল্পের জন্য বিনামূল্যে ফোন যাচাইকরণ কোটা শেষ হয়ে গেছে। প্রোডাকশনের জন্য বিলিং সক্ষম করুন, অথবা ডেভেলপমেন্টের জন্য টেস্ট ফোন নম্বর ব্যবহার করুন।';
      } else {
         description = `একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। বিস্তারিত: ${error.message}`;
      }
      
      toast({
        variant: 'destructive',
        title: 'OTP পাঠাতে ব্যর্থ',
        description: description,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
       toast({
        variant: 'destructive',
        title: 'অবৈধ OTP',
        description: 'অনুগ্রহ করে ৬-সংখ্যার সঠিক OTP কোডটি লিখুন।',
      });
      return;
    }

    if (!window.confirmationResult) {
      toast({
        variant: 'destructive',
        title: 'সেশন মেয়াদোত্তীর্ণ',
        description: 'যাচাইকরণ সেশনটি আর সক্রিয় নেই। অনুগ্রহ করে আবার চেষ্টা করুন।',
      });
      setOtpSent(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await window.confirmationResult.confirm(otp);
      await addUserToFirestore(result.user);
      toast({ title: 'একাউন্ট তৈরি সফল', description: "আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে।" });
      const redirectTo = searchParams.get('redirectTo') || '/dashboard';
      router.push(redirectTo);
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      let description = 'আপনি ভুল OTP দিয়েছেন। অনুগ্রহ করে আবার চেষ্টা করুন।';
       if (error.code === 'auth/invalid-verification-code') {
        description = 'আপনি যে OTP কোডটি দিয়েছেন তা ভুল। অনুগ্রহ করে আবার চেষ্টা করুন।';
      } else if (error.code === 'auth/code-expired') {
        description = 'আপনার OTP কোডের মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে আবার পাঠান।';
      }
      toast({
        variant: 'destructive',
        title: 'OTP যাচাইকরণ ব্যর্থ',
        description: description,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
       <ClientOnly>
        <Header />
      </ClientOnly>
      <main className="flex-grow flex items-center justify-center bg-muted/40 py-12">
        <div id="recaptcha-container"></div>
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle>একাউন্ট তৈরি করুন</CardTitle>
            <CardDescription>আপনার ফোন নম্বর দিয়ে সাইনআপ করুন।</CardDescription>
          </CardHeader>
          <CardContent>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="phone-number">ফোন নম্বর</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone-number"
                        type="tel"
                        placeholder="+8801XXXXXXXXX"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                      <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(!!checked)} />
                      <Label htmlFor="remember-me" className="font-normal">
                        আমাকে মনে রাখুন
                      </Label>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  OTP পাঠান
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="grid w-full items-center gap-1.5">
                   <Label htmlFor="otp">OTP কোড</Label>
                   <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="6-সংখ্যার কোড"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  যাচাই করে একাউন্ট তৈরি করুন
                </Button>
                <div className="flex justify-between text-sm">
                    <Button variant="link" type="button" onClick={() => { setOtpSent(false); setOtp(''); }} className="p-0 h-auto font-normal">
                      নম্বর পরিবর্তন করুন
                    </Button>
                    <Button
                        variant="link"
                        type="button"
                        onClick={() => handleSendOtp()}
                        disabled={resendCooldown > 0 || loading}
                        className="p-0 h-auto font-normal"
                    >
                        {resendCooldown > 0 ? `আবার পাঠান (${resendCooldown}s)` : 'OTP আবার পাঠান'}
                    </Button>
                </div>
              </form>
            )}
             <p className="mt-6 text-center text-sm text-muted-foreground">
              এর মধ্যেই একাউন্ট আছে?{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                লগইন করুন
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
      <ClientOnly>
        <Footer />
      </ClientOnly>
    </div>
  );
}
