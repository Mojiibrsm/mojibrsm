'use client';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { LanguageProvider } from '@/contexts/language-context';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';

export default function LoginPageContainer() {
    return (
        <LanguageProvider>
            <LoginPage />
        </LanguageProvider>
    )
}

function LoginPage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-grow flex items-center justify-center">
            <Card className="mx-auto max-w-sm w-full">
                <CardHeader>
                    <CardTitle className="text-2xl">{t.login.title}</CardTitle>
                    <CardDescription>{t.login.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">{t.login.emailLabel}</Label>
                            <Input id="email" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">{t.login.passwordLabel}</Label>
                                <Link href="#" className="ml-auto inline-block text-sm underline">
                                    {t.login.forgotPassword}
                                </Link>
                            </div>
                            <Input id="password" type="password" required />
                        </div>
                        <Button type="submit" className="w-full">
                            {t.login.buttonText}
                        </Button>
                    </div>
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
