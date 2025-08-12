
'use client';

import { useState, useCallback, useEffect } from 'react';
import { translations, Translations } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Save, PlusCircle, Trash2, Loader2, FileText, FolderSearch } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { updateSectionContent } from './actions';
import { addMediaItem, IMediaItem } from '@/services/data';
import { MediaLibraryDialog } from '@/components/media-library-dialog';

// Helper function to capitalize first letter
const capitalizeFirstLetter = (string: string) => {
  if (!string) return '';
  if (!isNaN(Number(string))) return `Item ${Number(string) + 1}`;
  return string.charAt(0).toUpperCase() + string.slice(1).replace(/([A-Z])/g, ' $1');
};

// Recursive component to render form fields
const RenderFields = ({ data, path, lang, handleFieldChange, handleAddItem, handleDeleteItem, handleBrowseMedia }: { 
    data: any, 
    path: (string | number)[], 
    lang: 'en' | 'bn', 
    handleFieldChange: (lang: 'en' | 'bn', path: (string | number)[], value: any) => void,
    handleAddItem: (lang: 'en' | 'bn', path: (string | number)[]) => void,
    handleDeleteItem: (lang: 'en' | 'bn', path: (string | number)[]) => void,
    handleBrowseMedia: (path: (string | number)[], lang: 'en' | 'bn') => void,
}) => {
  // Case 1: Data is a string (used for items in a string array)
  if (typeof data === 'string') {
    const elementId = `${lang}-${path.join('-')}`;
    const isTextarea = data.length > 80 || path.some(p => typeof p === 'string' && ['description', 'bio', 'mission', 'excerpt', 'details', 'content'].includes(p));
    return (
      <div key={elementId} className="w-full">
        {isTextarea ? (
             <Textarea
                id={elementId}
                value={data}
                onChange={(e) => handleFieldChange(lang, path, e.target.value)}
                className="w-full min-h-[120px]"
            />
        ) : (
            <Input
              id={elementId}
              value={data}
              onChange={(e) => handleFieldChange(lang, path, e.target.value)}
              className="w-full"
            />
        )}
      </div>
    );
  }

  if (typeof data !== 'object' || data === null) {
    return null;
  }

  // Case 2: Data is an array. Map over its items and recurse.
  if (Array.isArray(data)) {
    return (
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={`${lang}-${path.join('-')}-${index}`} className="relative border rounded-lg p-4 pt-10 bg-muted/20 shadow-inner">
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7"
              onClick={() => handleDeleteItem(lang, [...path, index])}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete Item</span>
            </Button>
            
            {typeof item === 'object' && item !== null && (
                <h5 className="text-sm font-semibold text-muted-foreground mb-2 absolute top-3 left-4">
                    {capitalizeFirstLetter(String(item.title || item.role || item.alt || item.label || `Item ${index + 1}`))}
                </h5>
             )}

            <RenderFields
              data={item}
              path={[...path, index]}
              lang={lang}
              handleFieldChange={handleFieldChange}
              handleAddItem={handleAddItem}
              handleDeleteItem={handleDeleteItem}
              handleBrowseMedia={handleBrowseMedia}
            />
          </div>
        ))}
        <Button onClick={() => handleAddItem(lang, path)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Item
        </Button>
      </div>
    );
  }

  // Case 3: Data is an object. Map over its key-value pairs.
  return Object.entries(data).map(([key, value]) => {
    const newPath = [...path, key];
    const elementId = `${lang}-${newPath.join('-')}`;

    if (typeof value === 'boolean') {
      return null; // Don't show boolean fields like 'popular'
    }

    if (typeof value === 'string') {
      const isTextarea = value.length > 80 || ['description', 'bio', 'mission', 'excerpt', 'details', 'content', 'metaDescription'].some(k => key.toLowerCase().includes(k));
      const isFileField = key.toLowerCase().includes('image') || key.toLowerCase().includes('logo') || key.toLowerCase().includes('avatar') || key.toLowerCase() === 'src' || key.toLowerCase() === 'cv_url';
      
      if (isFileField) {
        const isImage = !key.toLowerCase().includes('cv_url');
        
        const previewContent = isImage ? (
            <Image
                src={(value && (value.startsWith('http') || value.startsWith('/'))) ? value : 'https://placehold.co/100x100.png'}
                alt="Preview"
                width={80}
                height={80}
                className="h-full w-full object-cover rounded-md border"
                unoptimized
            />
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-muted rounded-md border text-muted-foreground p-2 text-center">
                <FileText className="h-8 w-8 mb-1 shrink-0" />
                <span className="text-xs break-all line-clamp-2">{value.split('/').pop()}</span>
            </div>
        );

        return (
          <div key={elementId} className="space-y-2 mb-4">
            <Label htmlFor={elementId}>{capitalizeFirstLetter(key)}</Label>
            <div className="flex items-start gap-4">
              <div className="relative w-20 h-20 shrink-0">
                {previewContent}
              </div>
              <div className="flex-grow space-y-2">
                <Button type="button" variant="outline" size="sm" onClick={() => handleBrowseMedia(newPath, lang)}>
                    <FolderSearch className="mr-2 h-4 w-4" /> Browse
                </Button>
                <p className="text-xs text-muted-foreground mt-1 break-all">URL: {value}</p>
              </div>
            </div>
          </div>
        );
      }

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

    if (typeof value === 'object' && value !== null) {
      return (
        <div key={elementId} className="p-4 border rounded-lg mt-4 bg-muted/30">
          <h4 className="text-md font-semibold mb-3 tracking-tight">{capitalizeFirstLetter(key)}</h4>
          <RenderFields data={value} path={newPath} lang={lang} handleFieldChange={handleFieldChange} handleAddItem={handleAddItem} handleDeleteItem={handleDeleteItem} handleBrowseMedia={handleBrowseMedia} />
        </div>
      );
    }

    return null;
  });
};

export default function AdminContentPage() {
  const [editableContent, setEditableContent] = useState<Translations>(translations);
  const [isMounted, setIsMounted] = useState(false);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<{ path: (string | number)[], lang: 'en' | 'bn' } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Deep clone the translations object only on the client side after mount
    // to prevent mutations to the original object and avoid SSR issues.
    setEditableContent(JSON.parse(JSON.stringify(translations)));
    setIsMounted(true);
  }, []);

  const handleFieldChange = useCallback((lang: 'en' | 'bn', path: (string | number)[], value: any) => {
    setEditableContent(prev => {
      const newContent = JSON.parse(JSON.stringify(prev));
      let current = newContent[lang];
      for (let i = 0; i < path.length - 1; i++) {
        const segment = path[i];
         if (current[segment] === undefined) {
            if(typeof path[i+1] === 'number') current[segment] = [];
            else current[segment] = {};
        }
        current = current[segment];
      }
      current[path[path.length - 1]] = value;
      return newContent;
    });
  }, []);
  
  const handleBrowseMedia = (path: (string | number)[], lang: 'en' | 'bn') => {
    setMediaTarget({ path, lang });
    setIsMediaDialogOpen(true);
  };

  const handleSelectFromLibrary = (item: IMediaItem) => {
      if (mediaTarget) {
          handleFieldChange(mediaTarget.lang, mediaTarget.path, item.url);
          toast({ title: 'Success', description: 'File selected from library.' });
      }
  };

  const handleAddItem = useCallback((lang: 'en' | 'bn', arrayPath: (string | number)[]) => {
    const isGalleryImages = arrayPath.length === 2 && arrayPath[0] === 'gallery' && arrayPath[1] === 'images';

    setEditableContent(prev => {
        const newContent = JSON.parse(JSON.stringify(prev));
        
        const processLanguage = (currentLang: 'en' | 'bn') => {
            let arrayToModify = newContent[currentLang];
            for (const segment of arrayPath) {
                arrayToModify = arrayToModify[segment];
            }

            if (!Array.isArray(arrayToModify)) return;

            let newItem;
            if (arrayToModify.length > 0) {
                const template = JSON.parse(JSON.stringify(arrayToModify[0]));
                if (typeof template === 'object' && template !== null) {
                    Object.keys(template).forEach(key => {
                        if (Array.isArray(template[key])) template[key] = [];
                        else if (typeof template[key] === 'boolean') template[key] = false;
                        else if (key === 'image' || key === 'src') template[key] = 'https://placehold.co/600x400.png';
                        else template[key] = `New ${capitalizeFirstLetter(key)}`;
                    });
                    newItem = template;
                } else {
                    newItem = "New Item";
                }
            } else {
              const arrayName = arrayPath[arrayPath.length - 1];
              if (['responsibilities', 'skills', 'tech', 'features', 'tags'].includes(arrayName as string)) {
                  newItem = "New Item";
              } else if (arrayName === 'jobs') {
                  newItem = { role: 'New Role', company: 'Company', period: 'Year - Year', responsibilities: [] };
              } else if (arrayName === 'items' && arrayPath.includes('services')) {
                  newItem = { icon: 'web', title: 'New Service', description: 'Description of the new service.' };
              } else if (arrayName === 'items' && arrayPath.includes('stats')) {
                  newItem = { value: '0', label: 'New Stat' };
              } else if (arrayName === 'projects') {
                  newItem = { title: 'New Project', tech: [], description: 'Description of new project.', link: '#', image: 'https://placehold.co/600x400.png', imageHint: 'project work' };
              } else if (arrayName === 'images' && arrayPath.includes('gallery')) {
                   newItem = { src: 'https://placehold.co/400x400.png', alt: 'New Image', imageHint: 'gallery image' };
              } else if (arrayName === 'posts') {
                  newItem = { slug: 'new-blog-post', title: 'New Blog Post', excerpt: 'A short excerpt.', content: '<p>Start writing your full blog content here. You can use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, etc.</p>', image: 'https://placehold.co/800x400.png', imageHint: 'blog post', date: 'Month Day, Year', tags: ['New Tag'], metaTitle: 'New Blog Post Meta Title', metaDescription: 'A short meta description for SEO.' };
              } else if (arrayName === 'packages') {
                  newItem = { name: 'New Package', price: '৳0', billing: 'one-time', popular: false, features: [] };
              } else {
                  // If we can't determine the structure, don't add anything.
                  // We only return here for the specific language being processed.
                  // The original `prev` will be returned later if both fail.
                  return; 
              }
            }
            if (newItem) {
              arrayToModify.push(newItem);
            }
        };

        if (isGalleryImages) {
            processLanguage('en');
            processLanguage('bn');
        } else {
            processLanguage(lang);
        }

        return newContent;
    });
  }, []);
  
  const handleDeleteItem = useCallback((lang: 'en' | 'bn', path: (string | number)[]) => {
    setEditableContent(prev => {
        const newContent = JSON.parse(JSON.stringify(prev));
        
        let parent = newContent[lang];
        // Navigate to the parent of the array
        for (let i = 0; i < path.length - 2; i++) {
            parent = parent[path[i]];
        }
        
        const arrayKey = path[path.length - 2];
        const indexToDelete = path[path.length - 1] as number;
        
        if (parent && Array.isArray(parent[arrayKey])) {
            parent[arrayKey].splice(indexToDelete, 1);
        }

        return newContent;
    });
  }, []);

  const handleSave = async (sectionKey: string) => {
    setIsSaving(sectionKey);
    const enData = editableContent.en[sectionKey as keyof typeof editableContent.en];
    const bnData = editableContent.bn[sectionKey as keyof typeof editableContent.bn];
    
    const result = await updateSectionContent(sectionKey, enData, bnData);
    
    if (result.success) {
      toast({ title: 'Success!', description: result.message });
    } else {
      toast({ title: 'Error!', description: result.message, variant: 'destructive' });
    }
    setIsSaving(null);
  };
  
  const sections = Object.keys(editableContent.en).filter(key => !['site', 'blog', 'contact', 'whatsapp'].includes(key));

  if (!isMounted) {
    return <div className="flex h-64 w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Site Content</h1>
          <p className="text-muted-foreground">Edit all textual and image content across your site (excluding blog posts).</p>
        </div>
      </div>
      
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-500/30">
          <AlertCircle className="h-5 w-5 mt-1 shrink-0" />
          <div>
              <h3 className="font-semibold">Important Notice</h3>
              <p className="text-sm">Changes saved here directly update the application's state. These changes are temporary and will be reset on page reload. To make permanent changes, modify the files in `src/lib/translations`.</p>
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
                <CardDescription>Edit content for both languages below. The changes will be reflected on the live site after saving.</CardDescription>
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
                      handleAddItem={handleAddItem}
                      handleDeleteItem={handleDeleteItem}
                      handleBrowseMedia={handleBrowseMedia}
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
                     handleAddItem={handleAddItem}
                     handleDeleteItem={handleDeleteItem}
                     handleBrowseMedia={handleBrowseMedia}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/30 px-6 py-4">
                 <Button onClick={() => handleSave(sectionKey)} disabled={isSaving === sectionKey}>
                    {isSaving === sectionKey ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save {capitalizeFirstLetter(sectionKey)}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      <MediaLibraryDialog 
        isOpen={isMediaDialogOpen}
        onOpenChange={setIsMediaDialogOpen}
        onSelect={handleSelectFromLibrary}
      />
    </div>
  );
}
