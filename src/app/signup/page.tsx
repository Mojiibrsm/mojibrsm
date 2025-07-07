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

export default function SignupPageContainer() {
    return (
        <LanguageProvider>
            <SignupPage />
        </LanguageProvider>
    )
}

function SignupPage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-grow flex items-center justify-center">
            <Card className="mx-auto max-w-sm w-full">
                <CardHeader>
                    <CardTitle className="text-2xl">{t.signup.title}</CardTitle>
                    <CardDescription>{t.signup.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                             <Label htmlFor="full-name">{t.signup.nameLabel}</Label>
                            <Input id="full-name" placeholder="Mojib Rsm" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">{t.signup.emailLabel}</Label>
                            <Input id="email" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">{t.signup.passwordLabel}</Label>
                            <Input id="password" type="password" required />
                        </div>
                        <Button type="submit" className="w-full">
                            {t.signup.buttonText}
                        </Button>
                    </div>
                    <div className="mt-4 text-center text-sm">
                        {t.signup.loginText}{" "}
                        <Link href="/login" className="underline">
                            {t.signup.loginLink}
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </main>
        <Footer />
    </div>
  );
}
