'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signInWithEmailAndPassword, signInWithPopup, AuthErrorCodes } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Link from 'next/link';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Google</title>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.62-4.82 1.62-3.87 0-7-3.13-7-7s3.13-7 7-7c1.93 0 3.53.72 4.68 1.88l2.5-2.5C18.43 1.93 15.68 1 12.48 1 7.02 1 3 5.02 3 10.5s4.02 9.5 9.48 9.5c2.62 0 4.72-.88 6.38-2.52 1.7-1.68 2.24-4.27 2.24-6.55 0-.57-.05-1.12-.14-1.62H12.48z"/>
    </svg>
);


export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: "Success", description: "Logged in successfully." });
      router.push('/dashboard');
    } catch (error: any) {
        console.error("Login failed:", error);
        let description = "An unexpected error occurred. Please try again.";
        switch(error.code) {
            case AuthErrorCodes.INVALID_LOGIN_CREDENTIALS:
                description = "Invalid email or password. Please try again.";
                break;
            case 'auth/operation-not-allowed':
                description = "Login method is not enabled in the Firebase console.";
                break;
            case 'auth/invalid-api-key':
                description = "Invalid Firebase API Key. Please check your configuration.";
                break;
        }
        toast({
            variant: "destructive",
            title: "Login Failed",
            description,
        });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast({ title: "Success", description: "Logged in successfully." });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Google Login failed:", error);
      let description = "Could not log in with Google. Please try again.";
       switch(error.code) {
            case 'auth/operation-not-allowed':
                description = "Google sign-in is not enabled in the Firebase console.";
                break;
            case 'auth/invalid-api-key':
                description = "Invalid Firebase API Key. Please check your configuration.";
                break;
            case 'auth/popup-closed-by-user':
                description = "The sign-in window was closed. Please try again.";
                break;
        }
      toast({
        variant: "destructive",
        title: "Google Login Failed",
        description,
      });
    } finally {
        setIsGoogleLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
            <Card className="mx-auto max-w-sm w-full">
                <CardHeader>
                    <CardTitle className="text-2xl">{t.login.title}</CardTitle>
                    <CardDescription>{t.login.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t.login.emailLabel}</FormLabel>
                                <FormControl>
                                  <Input placeholder="m@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                 <div className="flex items-center">
                                    <FormLabel>{t.login.passwordLabel}</FormLabel>
                                    <Link href="#" className="ml-auto inline-block text-sm underline">
                                        {t.login.forgotPassword}
                                    </Link>
                                </div>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="w-full" disabled={isLoading}>
                             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t.login.buttonText}
                          </Button>
                      </form>
                    </Form>
                     <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isGoogleLoading}>
                        {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
                        Continue with Google
                    </Button>
                    <div className="mt-4 text-center text-sm">
                        {t.login.signupText}{" "}
                        <Link href="/signup" className="underline">
                            {t.login.signupLink}
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </main>
        <Footer />
    </div>
  );
}
