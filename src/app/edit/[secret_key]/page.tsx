'use client';

import { useState, useEffect } from 'react';
import { translations, Translations } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Copy } from 'lucide-react';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';

const SECRET_KEY = process.env.NEXT_PUBLIC_EDIT_SECRET_KEY || 'mojibx';

export default function EditPage({ params }: { params: { secret_key: string } }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editableContent, setEditableContent] = useState<Translations>(translations);
  const { toast } = useToast();

  useEffect(() => {
    if (params.secret_key === SECRET_KEY) {
      setIsAuthenticated(true);
    }
  }, [params.secret_key]);

  const handleSectionChange = (lang: 'en' | 'bn', section: string, value: string) => {
    try {
      const parsedValue = JSON.parse(value);
      setEditableContent(prev => ({
        ...prev,
        [lang]: {
          ...prev[lang],
          [section]: parsedValue
        }
      }));
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Invalid JSON',
        description: `Error in ${capitalizeFirstLetter(section)} (${lang.toUpperCase()}). Please check syntax.`,
      });
    }
  };

  const handleCopyToClipboard = () => {
    const codeToCopy = `export const translations = ${JSON.stringify(editableContent, null, 2)};\n\nexport type Translations = typeof translations;\n`;
    navigator.clipboard.writeText(codeToCopy);
    toast({
      title: 'Code Copied!',
      description: 'The updated content code has been copied to your clipboard.',
    });
  };
  
  const capitalizeFirstLetter = (string: string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
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

  const sections = Object.keys(editableContent.en);

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <Header />
      <main className="flex-grow container py-12">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Content Editing Helper</CardTitle>
                <CardDescription>
                  Use the tabs to edit your site content. After making changes, copy the code and replace the content of your `src/lib/translations.ts` file.
                </CardDescription>
              </div>
              <Button onClick={handleCopyToClipboard} size="lg">
                <Copy className="mr-2 h-4 w-4" />
                Copy Updated Code
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-500/30">
                <AlertCircle className="h-5 w-5 mt-1 shrink-0" />
                <div>
                    <h3 className="font-semibold">Important Notice</h3>
                    <p className="text-sm">Changes made here are not saved automatically. This page is a tool to help you edit content easily. After editing, click the "Copy Updated Code" button and paste the result into your `src/lib/translations.ts` file to make the changes live.</p>
                </div>
            </div>
            <Tabs defaultValue={sections[0]} orientation="vertical" className="flex flex-col md:flex-row gap-6 relative">
              <TabsList className="w-full md:w-48 shrink-0 flex-col h-auto justify-start">
                {sections.map(key => (
                  <TabsTrigger key={key} value={key} className="w-full justify-start">{capitalizeFirstLetter(key)}</TabsTrigger>
                ))}
              </TabsList>
              {sections.map(sectionKey => (
                <TabsContent key={`${sectionKey}-content`} value={sectionKey} className="mt-0 w-full">
                  <Card className="shadow-inner bg-background/50">
                    <CardHeader>
                      <CardTitle>{capitalizeFirstLetter(sectionKey)} Section</CardTitle>
                      <CardDescription>Edit content for both languages below. Ensure the format remains valid JSON.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-2 text-lg">English</h3>
                        <Textarea
                          defaultValue={JSON.stringify(editableContent.en[sectionKey as keyof typeof editableContent.en], null, 2)}
                          onBlur={(e) => handleSectionChange('en', sectionKey, e.target.value)}
                          className="min-h-[60vh] font-mono text-sm bg-background"
                          spellCheck="false"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2 text-lg">বাংলা (Bengali)</h3>
                        <Textarea
                          defaultValue={JSON.stringify(editableContent.bn[sectionKey as keyof typeof editableContent.bn], null, 2)}
                          onBlur={(e) => handleSectionChange('bn', sectionKey, e.target.value)}
                          className="min-h-[60vh] font-mono text-sm bg-background"
                          spellCheck="false"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}