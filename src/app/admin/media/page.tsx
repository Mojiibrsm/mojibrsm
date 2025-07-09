
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getMediaItems, addMediaItem, deleteMediaItem, updateMediaItem, IMediaItem } from '@/services/data';
import Image from 'next/image';
import { Upload, Trash2, Copy, Loader2, ImageOff, Pencil, Crop as CropIcon } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FormattedTimestamp } from '@/components/formatted-timestamp';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';


export default function AdminMediaPage() {
    const [mediaItems, setMediaItems] = useState<IMediaItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [editingItem, setEditingItem] = useState<IMediaItem | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [croppingItem, setCroppingItem] = useState<IMediaItem | null>(null);

    const loadMedia = useCallback(() => {
        setMediaItems(getMediaItems());
    }, []);

    useEffect(() => {
        loadMedia();
    }, [loadMedia]);

    const handleFileUpload = async (file: File) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('destination', 's3');

        try {
            const response = await fetch('/api/upload', { method: 'POST', body: formData });
            const result = await response.json();
            if (response.ok && result.success) {
                addMediaItem({ url: result.url, name: file.name });
                toast({ title: "Upload Successful", description: `${file.name} has been added to the library.` });
                loadMedia(); // Refresh list
            } else {
                throw new Error(result.message || 'Upload failed');
            }
        } catch (error: any) {
            toast({ title: "Upload Error", description: error.message, variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };
    
    const handleDelete = (id: string) => {
        deleteMediaItem(id);
        toast({ title: "Media Deleted", description: "The item has been removed from the library." });
        loadMedia();
    };

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        toast({ title: "URL Copied", description: "The image URL has been copied to your clipboard." });
    };

    const handleEdit = (item: IMediaItem) => {
        setEditingItem({ ...item }); // Create a copy to edit
        setIsEditDialogOpen(true);
    };

    const handleCrop = (item: IMediaItem) => {
        setCroppingItem(item);
    };

    const handleSaveEdit = () => {
        if (!editingItem) return;

        updateMediaItem(editingItem.id, { name: editingItem.name });
        toast({ title: "Media Updated", description: "The image name has been saved." });
        loadMedia();
        setIsEditDialogOpen(false);
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
                        {mediaItems.length} items in the library. Deleting from here does not remove the file from the server.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {mediaItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                           <ImageOff className="h-12 w-12 mb-4" />
                           <p className="font-semibold">Your media library is empty.</p>
                           <p className="text-sm mt-1">Click "Upload New File" to get started.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                            {mediaItems.map(item => (
                                <Card key={item.id} className="group relative overflow-hidden">
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center gap-1">
                                         <Button size="icon" variant="secondary" onClick={() => handleCopyUrl(item.url)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                         <Button size="icon" variant="secondary" onClick={() => handleEdit(item)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="secondary" onClick={() => handleCrop(item)}>
                                            <CropIcon className="h-4 w-4" />
                                        </Button>
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="icon" variant="destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This removes the item from your library, but the file remains on the server. This action cannot be undone.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
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
                </CardContent>
            </Card>

             <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Media</DialogTitle>
                        <DialogDescription>
                           Change the details for this media item.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="media-name">Name (Alt Text)</Label>
                            <Input 
                                id="media-name" 
                                value={editingItem?.name || ''} 
                                onChange={(e) => setEditingItem(prev => prev ? { ...prev, name: e.target.value } : null)} 
                            />
                        </div>
                         <div className="space-y-2">
                           <Label>Preview</Label>
                           <Image src={editingItem?.url || ''} alt="Preview" width={200} height={200} className="rounded-md border bg-muted object-contain" unoptimized />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveEdit}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {croppingItem && (
                <CropImageDialog
                    item={croppingItem}
                    onClose={() => setCroppingItem(null)}
                    onSaveSuccess={() => {
                        loadMedia();
                        setCroppingItem(null);
                    }}
                />
            )}
        </div>
    );
}

function CropImageDialog({
    item,
    onClose,
    onSaveSuccess,
}: {
    item: IMediaItem;
    onClose: () => void;
    onSaveSuccess: (newItem: IMediaItem) => void;
}) {
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [isSaving, setIsSaving] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const { toast } = useToast();

    const getCroppedBlob = (image: HTMLImageElement, crop: PixelCrop): Promise<Blob | null> => {
        const canvas = document.createElement('canvas');
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return Promise.resolve(null);
        }
        
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );
        
        return new Promise((resolve) => {
            canvas.toBlob(resolve, 'image/png');
        });
    }

    const handleSaveCrop = async () => {
        if (!completedCrop || !imgRef.current || completedCrop.width === 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select an area to crop.' });
            return;
        }

        setIsSaving(true);
        try {
            const blob = await getCroppedBlob(imgRef.current, completedCrop);
            if (!blob) throw new Error('Could not create cropped image.');

            const croppedFile = new File([blob], `cropped_${item.name.replace(/\.[^/.]+$/, "")}.png`, { type: 'image/png' });
            
            const formData = new FormData();
            formData.append('file', croppedFile);
            formData.append('destination', 's3');

            const response = await fetch('/api/upload', { method: 'POST', body: formData });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Upload failed');
            }

            const newItem = addMediaItem({ url: result.url, name: croppedFile.name });
            toast({ title: 'Success', description: 'Cropped image saved to library.' });
            onSaveSuccess(newItem);
            onClose();

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Save Error', description: error.message });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Crop Image</DialogTitle>
                    <DialogDescription>Select the area you want to keep. Then click save.</DialogDescription>
                </DialogHeader>
                <div className="flex justify-center items-center p-4 bg-muted rounded-md min-h-[400px]">
                     <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                    >
                        <Image
                            ref={imgRef}
                            src={item.url}
                            alt="Image to crop"
                            width={800}
                            height={600}
                            className="max-h-[60vh] w-auto object-contain"
                            crossOrigin="anonymous" 
                            unoptimized
                        />
                    </ReactCrop>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button onClick={handleSaveCrop} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Cropped Image'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
