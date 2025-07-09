
'use client';

import { useState, useEffect, useCallback } from 'react';
import { translations, Translations } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Copy } from 'lucide-react';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const SECRET_KEY = 'mojibx';

// Helper function to capitalize first letter
const capitalizeFirstLetter = (string: string) => {
  if (!string) return '';
  if (!isNaN(Number(string))) return `Item ${Number(string) + 1}`;
  return string.charAt(0).toUpperCase() + string.slice(1).replace(/([A-Z])/g, ' $1');
};

// Recursive component to render form fields
const RenderFields = ({ data, path, lang, handleFieldChange }: { data: any, path: (string | number)[], lang: 'en' | 'bn', handleFieldChange: (lang: 'en' | 'bn', path: (string | number)[], value: any) => void }) => {
  if (typeof data !== 'object' || data === null) {
    return null;
  }

  return Object.entries(data).map(([key, value]) => {
    const newPath = [...path, key];
    const elementId = `${lang}-${newPath.join('-')}`;

    if (typeof value === 'string') {
      const isTextarea = value.length > 80 || ['description', 'bio', 'mission', 'excerpt'].includes(key);
      return (
        <div key={elementId} className="space-y-2 mb-4">
          <Label htmlFor={elementId}>{capitalizeFirstLetter(key)}</Label>
          {isTextarea ? (
            <Textarea
              id={elementId}
              value={value}
              onChange={(e) => handleFieldChange(lang, newPath, e.target.value)}
              className="min-h-[100px]"
            />
          ) : (
            <Input
              id={elementId}
              value={value}
              onChange={(e) => handleFieldChange(lang, newPath, e.target.value)}
            />
          )}
        </div>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div key={elementId} className="p-4 border rounded-lg mt-4 bg-muted/30">
          <h4 className="text-md font-semibold mb-3 tracking-tight">{capitalizeFirstLetter(key)}</h4>
          {value.map((item, index) => (
            <div key={`${elementId}-${index}`} className="mb-4 border-t pt-4">
                <RenderFields data={item} path={[...newPath, index]} lang={lang} handleFieldChange={handleFieldChange} />
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <div key={elementId} className="p-4 border rounded-lg mt-4">
          <h4 className="text-md font-semibold mb-3 tracking-tight">{capitalizeFirstLetter(key)}</h4>
          <RenderFields data={value} path={newPath} lang={lang} handleFieldChange={handleFieldChange} />
        </div>
      );
    }

    return null;
  });
};

export default function EditPage({ params }: { params: { secret_key: string } }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editableContent, setEditableContent] = useState<Translations>(translations);
  const { toast } = useToast();

  useEffect(() => {
    if (params.secret_key === SECRET_KEY) {
      setIsAuthenticated(true);
    }
  }, [params.secret_key]);

  const handleFieldChange = useCallback((lang: 'en' | 'bn', path: (string | number)[], value: any) => {
    setEditableContent(prev => {
      const newContent = JSON.parse(JSON.stringify(prev)); // Deep copy
      let current = newContent[lang];
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newContent;
    });
  }, []);

  const handleCopyToClipboard = () => {
    // A helper function to format the JSON string nicely
    const formatCode = (obj: object) => {
        const jsonString = JSON.stringify(obj, null, 2);
        // Add a trailing comma after the 'en' block for better formatting
        return jsonString.replace(/(\s+})\n(\s+)"bn":/g, '$1,\n$2"bn":');
    }

    const codeToCopy = `export const translations = ${formatCode(editableContent)};\n\nexport type Translations = typeof translations;\n`;

    navigator.clipboard.writeText(codeToCopy);
    toast({
      title: 'Code Copied!',
      description: 'The updated content code has been copied to your clipboard.',
    });
  };

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
                      <CardDescription>Edit content for both languages below. The changes will be reflected in the code you copy.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-2 text-lg">English</h3>
                        <Separator className="mb-4" />
                        <RenderFields
                            data={editableContent.en[sectionKey as keyof typeof editableContent.en]}
                            path={[]}
                            lang="en"
                            handleFieldChange={handleFieldChange}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2 text-lg">বাংলা (Bengali)</h3>
                        <Separator className="mb-4" />
                        <RenderFields
                           data={editableContent.bn[sectionKey as keyof typeof editableContent.bn]}
                           path={[]}
                           lang="bn"
                           handleFieldChange={handleFieldChange}
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
