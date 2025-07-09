'use client';

import { useState, useEffect, useMemo } from 'react';
import { translations, Translations } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Save, Loader2 } from 'lucide-react';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { auth, db } from '@/lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SECRET_KEY = process.env.NEXT_PUBLIC_EDIT_SECRET_KEY || 'change-me-to-something-secret';
const CONTENT_DOC_ID = 'live-content';

export default function EditPage({ params }: { params: { secret_key: string } }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [liveContent, setLiveContent] = useState<Translations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const authenticateAndFetch = async () => {
      if (params.secret_key !== SECRET_KEY) {
        setIsLoading(false);
        return;
      }

      try {
        await signInAnonymously(auth);
        setIsAuthenticated(true);
        
        const docRef = doc(db, "content", CONTENT_DOC_ID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setLiveContent(docSnap.data() as Translations);
        } else {
          // Seed the database with initial content from translations.ts
          await setDoc(docRef, translations);
          setLiveContent(translations);
          toast({ title: 'Database Seeded', description: 'Initial content has been saved to the database.' });
        }
      } catch (error) {
        console.error("Authentication or fetch error:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not authenticate or fetch content.' });
      } finally {
        setIsLoading(false);
      }
    };

    authenticateAndFetch();
  }, [params.secret_key, toast]);

  const handleSectionChange = (lang: 'en' | 'bn', section: string, value: string) => {
    try {
      const parsedValue = JSON.parse(value);
      setLiveContent(prev => {
        if (!prev) return null;
        return {
          ...prev,
          [lang]: {
            ...prev[lang],
            [section]: parsedValue
          }
        };
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Invalid JSON',
        description: `Error in ${capitalizeFirstLetter(section)} (${lang.toUpperCase()}). Please check syntax.`,
      });
    }
  };

  const handleSave = async () => {
    if (!liveContent || !isAuthenticated) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, "content", CONTENT_DOC_ID);
      await setDoc(docRef, liveContent, { merge: true });
      toast({
        title: 'Content Saved!',
        description: 'Your changes have been saved to the database and are now live.',
      });
    } catch (error) {
      console.error("Error saving content:", error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save changes to the database.',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const capitalizeFirstLetter = (string: string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  if (isLoading) {
    return (
       <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </main>
            <Footer />
        </div>
    )
  }

  if (!isAuthenticated) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-destructive">Access Denied</h1>
                    <p className="mt-4 text-muted-foreground">The secret key is incorrect or not provided.</p>
                </div>
            </main>
            <Footer />
        </div>
    );
  }
  
  if (!liveContent) {
    return <div>Error loading content.</div>
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <Header />
      <main className="flex-grow container py-12">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Website Content Editor</CardTitle>
                <CardDescription>
                  Edit your website content using the tabs below. When you're done, click "Save Changes" to make your updates live.
                </CardDescription>
              </div>
               <Button onClick={handleSave} size="lg" disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
               </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="en" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="bn">বাংলা (Bengali)</TabsTrigger>
              </TabsList>
              <TabsContent value="en" className="mt-4">
                <SectionEditor
                  lang="en"
                  content={liveContent.en}
                  onSectionChange={handleSectionChange}
                  capitalize={capitalizeFirstLetter}
                />
              </TabsContent>
              <TabsContent value="bn" className="mt-4">
                 <SectionEditor
                  lang="bn"
                  content={liveContent.bn}
                  onSectionChange={handleSectionChange}
                   capitalize={capitalizeFirstLetter}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

// Helper component for section editing
function SectionEditor({ lang, content, onSectionChange, capitalize }: { lang: 'en' | 'bn', content: any, onSectionChange: Function, capitalize: Function }) {
  const sections = Object.keys(content);
  
  return (
    <Tabs defaultValue={sections[0]} orientation="vertical" className="flex flex-col md:flex-row gap-6 relative">
      <TabsList className="w-full md:w-48 shrink-0 flex-col h-auto justify-start">
        {sections.map(key => (
          <TabsTrigger key={`${lang}-${key}`} value={key} className="w-full justify-start">{capitalize(key)}</TabsTrigger>
        ))}
      </TabsList>
      {sections.map(key => (
        <TabsContent key={`${lang}-${key}-content`} value={key} className="mt-0 w-full">
          <Card className="shadow-inner">
             <CardHeader>
                <CardTitle>{capitalize(key)} Section</CardTitle>
                <CardDescription>Edit the content for this section below. Ensure the format remains valid JSON.</CardDescription>
              </CardHeader>
            <CardContent>
               <Textarea
                key={`${lang}-${key}`} // Add key to force re-render on content change
                defaultValue={JSON.stringify(content[key], null, 2)}
                onBlur={(e) => onSectionChange(lang, key, e.target.value)}
                className="min-h-[50vh] font-mono text-sm bg-background"
                spellCheck="false"
              />
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}
