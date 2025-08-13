'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getMediaItems, addMediaItem, deleteMediaItem, updateMediaItem, IMediaItem } from '@/services/data';
import Image from 'next/image';
import { Upload, Trash2, Copy, Loader2, ImageOff, Pencil } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FormattedTimestamp } from '@/components/formatted-timestamp';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';


const uploadFileToServer = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Server-side upload failed.');
    }
    
    return await response.json();
};


export default function AdminMediaPage() {
    const [mediaItems, setMediaItems] = useState<IMediaItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const { toast } = useToast();
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [editingItem, setEditingItem] = useState<IMediaItem | null>(null);

    const loadMedia = useCallback(async () => {
        setIsLoading(true);
        try {
            const items = await getMediaItems();
            setMediaItems(items);
        } catch (error) {
             toast({ title: "Error Loading Media", description: "Could not fetch items from Firestore.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadMedia();
    }, [loadMedia]);

    const handleFileUpload = async (file: File) => {
        setIsUploading(true);
        
        try {
            const response = await uploadFileToServer(file);
            await addMediaItem({ url: response.url, name: file.name, fileId: response.fileId });
            toast({ title: "Upload Successful", description: `${file.name} has been added to the library.` });
            await loadMedia(); // Refresh list
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
    
    const handleDelete = async (item: IMediaItem) => {
        setIsDeleting(item.id);
        try {
            await deleteMediaItem(item);
            toast({ title: "Media Deleted", description: "The item has been removed from the library and ImageKit." });
            await loadMedia();
        } catch (error: any) {
             toast({ title: "Delete Error", description: error.message, variant: "destructive" });
        } finally {
            setIsDeleting(null);
        }
    };

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        toast({ title: "URL Copied", description: "The image URL has been copied to your clipboard." });
    };

    const handleEdit = (item: IMediaItem) => {
        setEditingItem(item);
    };

    const handleSaveSuccess = () => {
        loadMedia();
        setEditingItem(null);
    };


    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Media Library</h1>
                    <p className="text-muted-foreground">Manage all uploaded images and files.</p>
                </div>
                <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Upload New File
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,application/pdf" />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Media</CardTitle>
                    <CardDescription>
                        {mediaItems.length} items in the library. These files are stored on ImageKit. Deleting them here will also remove them from the server.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p className="ml-4">Loading media from Firebase...</p>
                        </div>
                    ) : mediaItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                           <ImageOff className="h-12 w-12 mb-4" />
                           <p className="font-semibold">Your media library is empty.</p>
                           <p className="text-sm mt-1">Click "Upload New File" to get started.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                            {mediaItems.map(item => (
                                <Card key={item.id} className="group relative overflow-hidden">
                                    {isDeleting === item.id ? (
                                        <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center gap-2 p-2">
                                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                                            <p className="text-white text-xs">Deleting...</p>
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center gap-2 p-2">
                                            <Button size="icon" variant="secondary" onClick={() => handleCopyUrl(item.url)} title="Copy URL">
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="secondary" onClick={() => handleEdit(item)} title="Edit Image">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button size="icon" variant="destructive" title="Delete Image">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>This will permanently delete the file from your ImageKit account and media library. This action cannot be undone.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(item)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    )}
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
                </CardContent>
            </Card>

            {editingItem && (
                <EditMediaDialog
                    item={editingItem}
                    isOpen={!!editingItem}
                    onOpenChange={(open) => !open && setEditingItem(null)}
                    onSaveSuccess={handleSaveSuccess}
                />
            )}
        </div>
    );
}


function EditMediaDialog({
    item,
    isOpen,
    onOpenChange,
    onSaveSuccess,
}: {
    item: IMediaItem;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSaveSuccess: () => void;
}) {
    const [activeTab, setActiveTab] = useState("details");
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    // Details State
    const [name, setName] = useState(item.name);

    // Crop State
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    
    // Resize State
    const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
    const [resizeDimensions, setResizeDimensions] = useState({ width: 0, height: 0 });
    const [keepAspectRatio, setKeepAspectRatio] = useState(true);

    const imgRef = useRef<HTMLImageElement>(null);

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        setResizeDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        
        const { width, height } = e.currentTarget
        const newCrop = centerCrop(
          makeAspectCrop(
            {
              unit: '%',
              width: 90,
            },
            1,
            width,
            height
          ),
          width,
          height
        )
        setCrop(newCrop);
    };

    const handleSaveDetails = async () => {
        setIsSaving(true);
        try {
            await updateMediaItem(item.id, { name });
            toast({ title: "Media Updated", description: "The image name has been saved." });
            onSaveSuccess();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
        setIsSaving(false);
    };

    const uploadEditedImage = async (blob: Blob | null, newName: string) => {
        if (!blob) throw new Error('Could not create edited image.');
        const editedFile = new File([blob], newName, { type: blob.type || 'image/png' });
        
        const response = await uploadFileToServer(editedFile);

        await addMediaItem({ url: response.url, name: editedFile.name, fileId: response.fileId });
    };

    const handleSaveCrop = async () => {
        if (!completedCrop || !imgRef.current || completedCrop.width === 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select an area to crop.' });
            return;
        }
        setIsSaving(true);
        try {
            const canvas = document.createElement('canvas');
            const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
            const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
            canvas.width = Math.floor(completedCrop.width * scaleX);
            canvas.height = Math.floor(completedCrop.height * scaleY);
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas context not available');

            ctx.drawImage(
                imgRef.current,
                completedCrop.x * scaleX,
                completedCrop.y * scaleY,
                completedCrop.width * scaleX,
                completedCrop.height * scaleY,
                0, 0,
                canvas.width, canvas.height
            );

            const blob = await new Promise<Blob|null>(resolve => canvas.toBlob(resolve, 'image/png'));
            await uploadEditedImage(blob, `cropped_${item.name.replace(/\.[^/.]+$/, "")}.png`);
            
            toast({ title: 'Success', description: 'Cropped image saved to library.' });
            onSaveSuccess();

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Save Error', description: error.message });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleSaveResize = async () => {
        if (!resizeDimensions.width || !resizeDimensions.height || !imgRef.current) {
             toast({ variant: 'destructive', title: 'Error', description: 'Invalid dimensions provided.' });
             return;
        }
        setIsSaving(true);
        try {
            const canvas = document.createElement('canvas');
            canvas.width = resizeDimensions.width;
            canvas.height = resizeDimensions.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas context not available');

            ctx.drawImage(imgRef.current, 0, 0, resizeDimensions.width, resizeDimensions.height);
            
            const blob = await new Promise<Blob|null>(resolve => canvas.toBlob(resolve, 'image/png'));
            await uploadEditedImage(blob, `resized_${item.name.replace(/\.[^/.]+$/, "")}.png`);
            
            toast({ title: 'Success', description: 'Resized image saved to library.' });
            onSaveSuccess();

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Save Error', description: error.message });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newWidth = parseInt(e.target.value, 10) || 0;
        if (keepAspectRatio && originalDimensions.width > 0) {
            const newHeight = Math.round((originalDimensions.height / originalDimensions.width) * newWidth);
            setResizeDimensions({ width: newWidth, height: newHeight });
        } else {
            setResizeDimensions(prev => ({ ...prev, width: newWidth }));
        }
    };

    const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHeight = parseInt(e.target.value, 10) || 0;
        if (keepAspectRatio && originalDimensions.height > 0) {
            const newWidth = Math.round((originalDimensions.width / originalDimensions.height) * newHeight);
            setResizeDimensions({ width: newWidth, height: newHeight });
        } else {
            setResizeDimensions(prev => ({ ...prev, height: newHeight }));
        }
    };
    
    const renderFooter = () => {
        let button;
        switch(activeTab) {
            case 'details':
                button = <Button onClick={handleSaveDetails} disabled={isSaving}>Save Details</Button>;
                break;
            case 'crop':
                button = <Button onClick={handleSaveCrop} disabled={isSaving}>Save Cropped Image</Button>;
                break;
            case 'resize':
                button = <Button onClick={handleSaveResize} disabled={isSaving}>Save Resized Image</Button>;
                break;
            default:
                button = null;
        }

        return (
             <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
                {isSaving ? <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</Button> : button}
            </DialogFooter>
        );
    }


    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Edit Media</DialogTitle>
                    <DialogDescription>
                       Make changes to your media item. Cropping or resizing will create a new item in the library.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col overflow-hidden">
                    <TabsList className="shrink-0">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="crop">Crop</TabsTrigger>
                        <TabsTrigger value="resize">Resize</TabsTrigger>
                    </TabsList>
                    
                    <div className="flex-grow py-4 overflow-y-auto">
                        <TabsContent value="details">
                            <div className="grid gap-4 py-4 max-w-md">
                                <div className="grid gap-2">
                                    <Label htmlFor="media-name">Name (Alt Text)</Label>
                                    <Input 
                                        id="media-name" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Preview</Label>
                                    <Image src={item.url} alt="Preview" width={200} height={200} className="rounded-md border bg-muted object-contain" unoptimized />
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="crop">
                            <div className="flex justify-center items-center bg-muted rounded-md min-h-[400px]">
                                <ReactCrop
                                    crop={crop}
                                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={1}
                                >
                                    <Image
                                        ref={imgRef}
                                        src={item.url}
                                        alt="Image to crop"
                                        width={800}
                                        height={600}
                                        onLoad={handleImageLoad}
                                        className="max-h-[60vh] w-auto object-contain"
                                        crossOrigin="anonymous" 
                                        unoptimized
                                    />
                                </ReactCrop>
                            </div>
                        </TabsContent>
                        <TabsContent value="resize">
                            <div className="grid gap-6 py-4 max-w-md">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="aspect-ratio" checked={keepAspectRatio} onCheckedChange={(checked) => setKeepAspectRatio(checked as boolean)} />
                                    <Label htmlFor="aspect-ratio">Keep Aspect Ratio</Label>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="grid gap-2">
                                        <Label htmlFor="width">Width</Label>
                                        <Input id="width" type="number" value={resizeDimensions.width} onChange={handleWidthChange} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="height">Height</Label>
                                        <Input id="height" type="number" value={resizeDimensions.height} onChange={handleHeightChange} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Preview</Label>
                                    <div className="flex justify-center items-center bg-muted rounded-md p-4">
                                        <Image
                                            ref={imgRef}
                                            src={item.url}
                                            alt="Preview"
                                            width={200}
                                            height={200}
                                            className="rounded-md border bg-muted object-contain"
                                            crossOrigin="anonymous" 
                                            unoptimized
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
                {renderFooter()}
            </DialogContent>
        </Dialog>
    );
}

    
