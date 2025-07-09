
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
  // Check if string is a number (for array indices)
  if (!isNaN(Number(string))) return `Item ${Number(string) + 1}`;
  // Add spaces before capital letters for camelCase
  return string.charAt(0).toUpperCase() + string.slice(1).replace(/([A-Z])/g, ' $1');
};

// Recursive component to render form fields
const RenderFields = ({ data, path, lang, handleFieldChange }: { data: any, path: (string | number)[], lang: 'en' | 'bn', handleFieldChange: (lang: 'en' | 'bn', path: (string | number)[], value: any) => void }) => {
  // Case 1: Data is a string (used for items in a string array like skills)
  if (typeof data === 'string') {
    const elementId = `${lang}-${path.join('-')}`;
    return (
      <div key={elementId} className="flex items-center gap-2 mb-2">
        <Input
          id={elementId}
          value={data}
          onChange={(e) => handleFieldChange(lang, path, e.target.value)}
        />
      </div>
    );
  }

  // If data is not an object or is null, we can't render it.
  if (typeof data !== 'object' || data === null) {
    return null;
  }

  // Case 2: Data is an array. Map over its items and recurse.
  if (Array.isArray(data)) {
    return (
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={`${lang}-${path.join('-')}-${index}`} className="border-l-2 pl-4 ml-1 pt-4 first:pt-0 first:border-l-0 first:pl-0 first:ml-0">
             {typeof item === 'object' && item !== null && (
                <h5 className="text-sm font-semibold text-muted-foreground mb-2">
                    {/* Heuristic to find a title for the object */}
                    {capitalizeFirstLetter(String(item.title || item.role || `Item ${index + 1}`))}
                </h5>
             )}
            <RenderFields
              data={item}
              path={[...path, index]}
              lang={lang}
              handleFieldChange={handleFieldChange}
            />
          </div>
        ))}
      </div>
    );
  }

  // Case 3: Data is an object. Map over its key-value pairs.
  return Object.entries(data).map(([key, value]) => {
    const newPath = [...path, key];
    const elementId = `${lang}-${newPath.join('-')}`;

    // Handle primitive values like strings
    if (typeof value === 'string') {
      const isTextarea = value.length > 80 || ['description', 'bio', 'mission', 'excerpt', 'details'].some(k => key.toLowerCase().includes(k));
      const isImageURL = key.toLowerCase().includes('image') || key.toLowerCase().includes('avatar');
      
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
              placeholder={isImageURL ? 'Enter image URL or hint' : ''}
            />
          )}
        </div>
      );
    }

    // Handle nested objects or arrays by recursing
    if (typeof value === 'object' && value !== null) {
      return (
        <div key={elementId} className="p-4 border rounded-lg mt-4 bg-muted/30">
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
        const segment = path[i];
        if (current[segment] === undefined) { // Path safety
            if(typeof path[i+1] === 'number') current[segment] = [];
            else current[segment] = {};
        }
        current = current[segment];
      }
      current[path[path.length - 1]] = value;
      return newContent;
    });
  }, []);

  const handleCopyToClipboard = () => {
    const formatCode = (obj: object) => {
        const jsonString = JSON.stringify(obj, null, 2);
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
                            path={[sectionKey]}
                            lang="en"
                            handleFieldChange={handleFieldChange}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2 text-lg">বাংলা (Bengali)</h3>
                        <Separator className="mb-4" />
                        <RenderFields
                           data={editableContent.bn[sectionKey as keyof typeof editableContent.bn]}
                           path={[sectionKey]}
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
