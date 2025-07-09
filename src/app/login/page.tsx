
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Phone, KeyRound } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { addUserToFirestore } from '@/services/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
    confirmationResult: ConfirmationResult;
  }
}

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    // This effect runs once to set up the reCAPTCHA verifier
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
      });
    }
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation for phone number with country code
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
      const verifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      window.confirmationResult = confirmationResult;
      setOtpSent(true);
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
        description = 'নেটওয়ার্ক অনুরোধ ব্যর্থ হয়েছে। এটি সাধারণত ফায়ারবেস কনফিগারেশন সমস্যার কারণে হয়।';
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
    setLoading(true);
    try {
      const result = await window.confirmationResult.confirm(otp);
      await addUserToFirestore(result.user);
      toast({ title: 'লগইন সফল', description: "আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে।" });
      const redirectTo = searchParams.get('redirectTo') || '/dashboard';
      router.push(redirectTo);
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast({
        variant: 'destructive',
        title: 'OTP যাচাইকরণ ব্যর্থ',
        description: 'আপনি ভুল OTP দিয়েছেন। অনুগ্রহ করে আবার চেষ্টা করুন।',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-muted/40 py-12">
        <div id="recaptcha-container"></div>
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle>স্বাগতম!</CardTitle>
            <CardDescription>আপনার ফোন নম্বর দিয়ে লগইন বা সাইনআপ করুন।</CardDescription>
          </CardHeader>
          <CardContent>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ফোন নম্বর
                  </label>
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
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  OTP পাঠান
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                   <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    OTP কোড
                  </label>
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
                  যাচাই করুন
                </Button>
                 <Button variant="link" onClick={() => setOtpSent(false)} className="w-full">
                  নম্বর পরিবর্তন করুন
                </Button>
              </form>
            )}
             <p className="mt-6 text-center text-sm text-muted-foreground">
              কোনো একাউন্ট নেই?{' '}
              <span className="font-semibold text-primary">
                শুধু নম্বর দিয়ে OTP নিন, একাউন্ট তৈরি হয়ে যাবে।
              </span>
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
