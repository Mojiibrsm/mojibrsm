'use client';

import { useState, useEffect } from 'react';
import { translations } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy } from 'lucide-react';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';

// IMPORTANT: Change this to your own secret key for security.
const SECRET_KEY = 'change-me-to-something-secret';

export default function EditPage({ params }: { params: { secret_key: string } }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [liveContent, setLiveContent] = useState(translations);
  const { toast } = useToast();

  useEffect(() => {
    if (params.secret_key === SECRET_KEY) {
      setIsAuthenticated(true);
    }
  }, [params.secret_key]);

  const handleSectionChange = (lang: 'en' | 'bn', section: string, value: string) => {
    try {
      const parsedValue = JSON.parse(value);
      setLiveContent(prev => ({
        ...prev,
        [lang]: {
          ...prev[lang],
          [section]: parsedValue
        }
      }));
       toast({
        title: 'Section Updated',
        description: `Content for ${capitalizeFirstLetter(section)} (${lang.toUpperCase()}) is updated in the editor.`,
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Invalid JSON',
        description: `Error in ${lang.toUpperCase()} - ${section} section. Please check your syntax. Changes were not saved.`,
      });
    }
  };

  const handleCopy = () => {
    try {
      const fullContentString = JSON.stringify(liveContent, null, 2);
      const fileContent = `export const translations = ${fullContentString};\n\nexport type Translations = typeof translations;`;
      navigator.clipboard.writeText(fileContent);
      toast({
        title: 'Copied to Clipboard!',
        description: 'You can now paste this into your src/lib/translations.ts file.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Generating Code',
        description: 'Could not generate the final code. Please check for errors.',
      });
    }
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

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <Header />
      <main className="flex-grow container py-12">
        <Card>
          <CardHeader>
            <CardTitle>Website Content Editor</CardTitle>
            <CardDescription>
              Edit your website content using the tabs below. Select a language, then a section to edit.
              When you're done, click "Copy Full Code" and replace the entire content of <code>src/lib/translations.ts</code>.
            </CardDescription>
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
            <Button onClick={handleCopy} size="lg" className="w-full !mt-8">
              <Copy className="mr-2 h-4 w-4" />
              Copy Full Code
            </Button>
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
