
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, PlusCircle, Trash2, Loader2, FolderSearch } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { updateSectionContent, getSectionContent } from './actions';
import { IMediaItem } from '@/services/data';
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

  return Object.entries(data).map(([key, value]) => {
    const newPath = [...path, key];
    const elementId = `${lang}-${newPath.join('-')}`;

    if (typeof value === 'boolean') {
      return null;
    }

    if (typeof value === 'string') {
      const isTextarea = value.length > 80 || ['description', 'bio', 'mission', 'excerpt', 'details', 'content', 'metaDescription'].some(k => key.toLowerCase().includes(k));
      const isFileField = key.toLowerCase().includes('image') || key.toLowerCase().includes('logo') || key.toLowerCase().includes('avatar') || key.toLowerCase() === 'src' || key.toLowerCase() === 'cv_url';
      
      if (isFileField) {
        return (
          <div key={elementId} className="space-y-2 mb-4">
            <Label htmlFor={elementId}>{capitalizeFirstLetter(key)}</Label>
            <div className="flex items-start gap-4">
              <div className="relative w-20 h-20 shrink-0 border rounded-md p-1">
                 <Image
                    src={(value && (value.startsWith('http') || value.startsWith('/'))) ? value : 'https://placehold.co/100x100.png'}
                    alt="Preview"
                    width={80}
                    height={80}
                    className="h-full w-full object-contain rounded-md"
                    unoptimized
                />
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
  const [content, setContent] = useState<Record<string, { en: any; bn: any }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<{ section: string; path: (string | number)[], lang: 'en' | 'bn' } | null>(null);
  const { toast } = useToast();

  const sections = ['hero', 'about', 'stats', 'services', 'experience', 'skills', 'portfolio', 'gallery', 'pricing', 'footer'];

  useEffect(() => {
    const fetchAllContent = async () => {
      setIsLoading(true);
      const contentPromises = sections.map(section => getSectionContent(section));
      const allContentData = await Promise.all(contentPromises);
      
      const newContentState: Record<string, { en: any; bn: any }> = {};
      sections.forEach((section, index) => {
        newContentState[section] = allContentData[index];
      });

      setContent(newContentState);
      setIsLoading(false);
    };

    fetchAllContent();
  }, []);

  const handleFieldChange = useCallback((lang: 'en' | 'bn', section: string, path: (string | number)[], value: any) => {
    setContent(prev => {
      const newContent = JSON.parse(JSON.stringify(prev));
      let current = newContent[section][lang];
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
  
  const handleBrowseMedia = (section: string, path: (string | number)[], lang: 'en' | 'bn') => {
    setMediaTarget({ section, path, lang });
    setIsMediaDialogOpen(true);
  };

  const handleSelectFromLibrary = (item: IMediaItem) => {
      if (mediaTarget) {
          handleFieldChange(mediaTarget.lang, mediaTarget.section, mediaTarget.path, item.url);
          toast({ title: 'Success', description: 'File selected from library.' });
      }
  };

  const handleAddItem = useCallback((lang: 'en' | 'bn', section: string, arrayPath: (string | number)[]) => {
     setContent(prev => {
        const newContent = JSON.parse(JSON.stringify(prev));
        let arrayToModify = newContent[section][lang];
        for (const segment of arrayPath) {
            arrayToModify = arrayToModify[segment];
        }

        if (!Array.isArray(arrayToModify)) return prev;

        let newItem = {};
        if (arrayToModify.length > 0) {
            const template = JSON.parse(JSON.stringify(arrayToModify[0]));
            Object.keys(template).forEach(key => {
                if (Array.isArray(template[key])) template[key] = [];
                else if (typeof template[key] === 'boolean') template[key] = false;
                else if (key === 'image' || key === 'src') template[key] = 'https://placehold.co/600x400.png';
                else template[key] = `New ${capitalizeFirstLetter(key)}`;
            });
            newItem = template;
        } else {
          // Add default structures for empty arrays based on section and key
          if (arrayPath.includes('jobs')) newItem = { role: 'New Role', company: 'Company', period: 'Year - Year', responsibilities: ['New Responsibility'] };
          else if (arrayPath.includes('items') && section === 'services') newItem = { icon: 'web', title: 'New Service', description: 'New service description.' };
          else if (arrayPath.includes('projects')) newItem = { title: 'New Project', tech: ['Next.js'], description: 'Project description.', link: '#', image: 'https://placehold.co/600x400.png', imageHint: 'project' };
          else if (arrayPath.includes('images')) newItem = { src: 'https://placehold.co/400x400.png', alt: 'New Image', imageHint: 'gallery' };
          else if (arrayPath.includes('packages')) newItem = { name: 'New Package', price: '0', billing: 'one-time', popular: false, features: ['New Feature'] };
          else if (arrayPath.includes('skills')) newItem = "New Skill";
          else newItem = "New Item";
        }
        
        arrayToModify.push(newItem);
        return newContent;
    });
  }, []);
  
  const handleDeleteItem = useCallback((lang: 'en' | 'bn', section: string, path: (string | number)[]) => {
    setContent(prev => {
        const newContent = JSON.parse(JSON.stringify(prev));
        let parent = newContent[section][lang];
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
    const sectionData = content[sectionKey];
    if (!sectionData) {
        toast({ title: 'Error!', description: `No data found for section ${sectionKey}`, variant: 'destructive' });
        setIsSaving(null);
        return;
    }
    
    const result = await updateSectionContent(sectionKey, sectionData.en, sectionData.bn);
    
    if (result.success) {
      toast({ title: 'Success!', description: result.message });
    } else {
      toast({ title: 'Error!', description: result.message, variant: 'destructive' });
    }
    setIsSaving(null);
  };
  
  if (isLoading) {
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
                <CardDescription>Edit content for both languages below. Changes are saved to Firestore.</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2 text-lg">English</h3>
                  <Separator className="mb-4" />
                  {content[sectionKey] && <RenderFields
                      data={content[sectionKey].en}
                      path={[]}
                      lang="en"
                      handleFieldChange={(lang, path, value) => handleFieldChange(lang, sectionKey, path, value)}
                      handleAddItem={(lang, path) => handleAddItem(lang, sectionKey, path)}
                      handleDeleteItem={(lang, path) => handleDeleteItem(lang, sectionKey, path)}
                      handleBrowseMedia={(path, lang) => handleBrowseMedia(sectionKey, path, lang)}
                  />}
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-lg">বাংলা (Bengali)</h3>
                  <Separator className="mb-4" />
                  {content[sectionKey] && <RenderFields
                     data={content[sectionKey].bn}
                     path={[]}
                     lang="bn"
                     handleFieldChange={(lang, path, value) => handleFieldChange(lang, sectionKey, path, value)}
                     handleAddItem={(lang, path) => handleAddItem(lang, sectionKey, path)}
                     handleDeleteItem={(lang, path) => handleDeleteItem(lang, sectionKey, path)}
                     handleBrowseMedia={(path, lang) => handleBrowseMedia(sectionKey, path, lang)}
                  />}
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
