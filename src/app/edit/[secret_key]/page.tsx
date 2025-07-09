'use client';

import { useState, useEffect } from 'react';
import { translations } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Copy } from 'lucide-react';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';

// IMPORTANT: Change this to your own secret key for security.
const SECRET_KEY = 'change-me-to-something-secret';

export default function EditPage({ params }: { params: { secret_key: string } }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [content, setContent] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (params.secret_key === SECRET_KEY) {
      setIsAuthenticated(true);
      setContent(JSON.stringify(translations, null, 2));
    }
  }, [params.secret_key]);

  const handleCopy = () => {
    try {
        // First, validate the JSON to ensure it's well-formed
        JSON.parse(content);
        
        const fileContent = `export const translations = ${content};\n\nexport type Translations = typeof translations;`;
        navigator.clipboard.writeText(fileContent);
        toast({
            title: 'Copied to Clipboard!',
            description: 'You can now paste this into your src/lib/translations.ts file.',
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Invalid JSON',
            description: 'The content is not valid JSON. Please correct it before copying.',
        });
    }
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

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <Header />
      <main className="flex-grow container py-12">
        <Card>
          <CardHeader>
            <CardTitle>Content Editor</CardTitle>
            <CardDescription>
              Edit the content below. This is the live data for your website from <code>src/lib/translations.ts</code>.
              After editing, click "Copy Updated Code" and replace the entire content of that file with the copied code.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="editor" className="text-sm font-medium">Website Content (JSON format)</Label>
              <Textarea
                id="editor"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[60vh] font-code text-sm bg-background"
                spellCheck="false"
              />
            </div>
            <Button onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Updated Code
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
