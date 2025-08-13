
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { getMediaItems, addMediaItem, IMediaItem } from '@/services/data';
import { FormattedTimestamp } from '@/components/formatted-timestamp';
import { Search, ImageOff, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import IK from 'imagekit-javascript';

const imagekit = new IK({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
    authenticationEndpoint: '/api/imagekit-auth',
});

interface MediaLibraryDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (item: IMediaItem) => void;
}

export function MediaLibraryDialog({ isOpen, onOpenChange, onSelect }: MediaLibraryDialogProps) {
    const [mediaItems, setMediaItems] = useState<IMediaItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadMedia = useCallback(async () => {
        setIsLoading(true);
        try {
            const items = await getMediaItems();
            setMediaItems(items);
        } catch (error) {
            toast({ title: "Error loading media", description: "Could not fetch media from Firebase.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        if (isOpen) {
            loadMedia();
        }
    }, [isOpen, loadMedia]);

    const handleFileUpload = async (file: File) => {
        setIsUploading(true);
        try {
            const result = await imagekit.upload({
                file: file,
                fileName: file.name,
                useUniqueFileName: true,
                folder: "/portfolio-uploads/",
            });
            const newItem = await addMediaItem({ url: result.url, name: file.name, fileId: result.fileId });
            toast({ title: "Upload Successful", description: `${file.name} has been added.` });
            await loadMedia(); // Refresh list to show the new item
            onSelect(newItem); // Automatically select the newly uploaded item
        } catch (error: any) {
            toast({ title: "Upload Error", description: error.message, variant: "destructive" });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const filteredItems = mediaItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (item: IMediaItem) => {
        onSelect(item);
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Media Library</DialogTitle>
                    <DialogDescription>Select an existing file from your library or upload a new one.</DialogDescription>
                </DialogHeader>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search for files..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <ScrollArea className="flex-1 -mx-6">
                    <div className="px-6 py-4">
                        {isLoading ? (
                             <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
                        ) : filteredItems.length === 0 && !isUploading ? (
                             <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg h-full">
                                <ImageOff className="h-12 w-12 mb-4" />
                                <p className="font-semibold">No media found.</p>
                                <p className="text-sm mt-1">Your search did not match any files.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {filteredItems.map(item => (
                                    <Card 
                                        key={item.id} 
                                        className="group relative overflow-hidden cursor-pointer"
                                        onClick={() => handleSelect(item)}
                                    >
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                                            <p className="text-white font-bold text-lg">Select</p>
                                        </div>
                                        <Image src={item.url} alt={item.name} width={200} height={200} className="w-full h-full object-cover aspect-square bg-muted" unoptimized/>
                                        <CardFooter className="p-2 text-xs absolute bottom-0 w-full bg-background/80">
                                            <div className="truncate">
                                                <p className="font-semibold truncate">{item.name}</p>
                                                <FormattedTimestamp timestamp={item.createdAt} format="toLocaleDateString" />
                                            </div>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </ScrollArea>
                 <DialogFooter className="border-t pt-4">
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,application/pdf" />
                    <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Upload New File
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
