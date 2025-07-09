
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Pencil, Trash2, Loader2, Save, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { translations } from '@/lib/translations';
import { updateBlogPosts } from './actions';
import Image from 'next/image';

type Post = (typeof translations.en.blog.posts)[0];
type EditablePost = { en: Post; bn: Post; index: number };

const newEnPostTemplate: Post = { slug: 'new-post-slug', title: 'New Blog Post', excerpt: 'A short excerpt for the new post.', content: '<p>Start writing your amazing blog content here!</p>', image: 'https://placehold.co/800x400.png', imageHint: 'blog post', date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), tags: ['New Tag'], metaTitle: 'New Post Meta Title', metaDescription: 'New post meta description for SEO.' };
const newBnPostTemplate: Post = { slug: 'new-post-slug', title: 'নতুন ব্লগ পোস্ট', excerpt: 'নতুন পোস্টের জন্য একটি সংক্ষিপ্ত অংশ।', content: '<p>আপনার অসাধারণ ব্লগ কন্টেন্ট এখানে লেখা শুরু করুন!</p>', image: 'https://placehold.co/800x400.png', imageHint: 'blog post', date: new Date().toLocaleDateString('bn-BD', { month: 'long', day: 'numeric', year: 'numeric' }), tags: ['নতুন ট্যাগ'], metaTitle: 'নতুন পোস্টের মেটা টাইটেল', metaDescription: 'এসইও এর জন্য নতুন পোস্টের মেটা বিবরণ।' };


export default function AdminBlogPage() {
    const [posts, setPosts] = useState<{ en: Post[], bn: Post[] }>({ en: [], bn: [] });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<EditablePost | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setPosts({
            en: JSON.parse(JSON.stringify(translations.en.blog.posts)),
            bn: JSON.parse(JSON.stringify(translations.bn.blog.posts)),
        });
    }, []);

    const handleAddNew = () => {
        const uniqueSlug = `new-post-${Date.now()}`;
        setEditingPost({
            en: { ...newEnPostTemplate, slug: uniqueSlug },
            bn: { ...newBnPostTemplate, slug: uniqueSlug },
            index: -1,
        });
        setIsDialogOpen(true);
    };

    const handleEdit = (index: number) => {
        setEditingPost({
            en: posts.en[index],
            bn: posts.bn[index],
            index,
        });
        setIsDialogOpen(true);
    };
    
    const handleDelete = (indexToDelete: number) => {
        setPosts(prev => ({
            en: prev.en.filter((_, index) => index !== indexToDelete),
            bn: prev.bn.filter((_, index) => index !== indexToDelete),
        }));
        toast({ title: "Post Removed", description: "The post has been removed from the list. Click 'Save Changes' to make it permanent." });
    };

    const handleSaveFromDialog = (data: EditablePost) => {
        const { en, bn, index } = data;
        if (index === -1) { // New post
            setPosts(prev => ({
                en: [en, ...prev.en],
                bn: [bn, ...prev.bn],
            }));
        } else { // Editing existing post
            setPosts(prev => {
                const newEn = [...prev.en];
                const newBn = [...prev.bn];
                newEn[index] = en;
                newBn[index] = bn;
                return { en: newEn, bn: newBn };
            });
        }
        setIsDialogOpen(false);
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        const result = await updateBlogPosts(posts);
        toast({
            title: result.success ? 'Success!' : 'Error!',
            description: result.message,
            variant: result.success ? 'default' : 'destructive'
        });
        setIsSaving(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Manage Blog Posts</h1>
                    <p className="text-muted-foreground">Add, edit, and manage all blog posts for your website.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Add New Post</Button>
                    <Button onClick={handleSaveAll} disabled={isSaving} size="lg">
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save All Changes
                    </Button>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Posts</CardTitle>
                    <CardDescription>A list of all blog posts currently on your site.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title (English)</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Tags</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.en.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="h-24 text-center">No blog posts found.</TableCell></TableRow>
                            ) : (
                                posts.en.map((post, index) => (
                                    <TableRow key={post.slug + index}>
                                        <TableCell className="font-medium">{post.title}</TableCell>
                                        <TableCell className="text-muted-foreground">{post.slug}</TableCell>
                                        <TableCell>{post.date}</TableCell>
                                        <TableCell className="max-w-xs flex flex-wrap gap-1">
                                            {post.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(index)}><Pencil className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will remove the post from the list. You must click "Save All Changes" to make it permanent. This action cannot be undone after saving.</AlertDialogDescription></AlertDialogHeader>
                                                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(index)} className="bg-destructive hover:bg-destructive/90">Yes, delete</AlertDialogAction></AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {isDialogOpen && (
                <PostFormDialog 
                    isOpen={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    onSave={handleSaveFromDialog}
                    post={editingPost}
                />
            )}
        </div>
    );
}

// Sub-component for the blog post form dialog
function PostFormDialog({ isOpen, onOpenChange, onSave, post }: { isOpen: boolean; onOpenChange: (open: boolean) => void; onSave: (data: EditablePost) => void; post: EditablePost | null; }) {
    const [formData, setFormData] = useState<EditablePost | null>(post ? JSON.parse(JSON.stringify(post)) : null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const { toast } = useToast();

    const handleFieldChange = (lang: 'en' | 'bn', field: keyof Post, value: string | string[]) => {
        if (!formData) return;
        
        let newFormData = { ...formData };

        if(field === 'slug') {
            newFormData.en.slug = value as string;
            newFormData.bn.slug = value as string;
        } else {
            (newFormData[lang] as any)[field] = value;
        }

        setFormData(newFormData);
    };
    
    const handleImageUpload = async (file: File) => {
        if (!formData) return;
        setUploadingImage(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('destination', 's3');
        try {
            const response = await fetch('/api/upload', { method: 'POST', body: uploadFormData });
            const result = await response.json();
            if (response.ok && result.success) {
                // Update image for both languages to keep them consistent
                handleFieldChange('en', 'image', result.url);
                handleFieldChange('bn', 'image', result.url);
                toast({ title: "Image Uploaded", description: "Image URL has been updated." });
            } else {
                throw new Error(result.message || 'Upload failed');
            }
        } catch (error: any) {
            toast({ title: "Upload Error", description: error.message, variant: "destructive" });
        } finally {
            setUploadingImage(false);
        }
      };


    const handleSubmit = () => {
        if(formData) onSave(formData);
    };
    
    if(!formData) return null;

    const renderFormFields = (lang: 'en' | 'bn') => {
        const data = formData[lang];
        return (
            <div className="space-y-4">
                {lang === 'en' && <div className="space-y-1"><Label>Slug (URL Identifier)</Label><Input value={data.slug} onChange={e => handleFieldChange(lang, 'slug', e.target.value)} /><p className="text-xs text-muted-foreground">Keep this unique and sync'd across languages.</p></div>}
                {lang === 'bn' && <div className="space-y-1"><Label>Slug (URL Identifier)</Label><Input value={data.slug} disabled /></div>}
                
                <div className="space-y-1"><Label>Title</Label><Input value={data.title} onChange={e => handleFieldChange(lang, 'title', e.target.value)} /></div>
                <div className="space-y-1"><Label>Date</Label><Input value={data.date} onChange={e => handleFieldChange(lang, 'date', e.target.value)} /></div>
                <div className="space-y-1"><Label>Excerpt</Label><Textarea value={data.excerpt} onChange={e => handleFieldChange(lang, 'excerpt', e.target.value)} className="h-24" /></div>
                <div className="space-y-1"><Label>Content (HTML)</Label><Textarea value={data.content} onChange={e => handleFieldChange(lang, 'content', e.target.value)} className="h-40 font-mono" /></div>
                <div className="space-y-1"><Label>Tags (comma separated)</Label><Input value={data.tags.join(', ')} onChange={e => handleFieldChange(lang, 'tags', e.target.value.split(',').map(t => t.trim()))} /></div>
                <div className="space-y-1"><Label>Meta Title (for SEO)</Label><Input value={data.metaTitle} onChange={e => handleFieldChange(lang, 'metaTitle', e.target.value)} /></div>
                <div className="space-y-1"><Label>Meta Description (for SEO)</Label><Textarea value={data.metaDescription} onChange={e => handleFieldChange(lang, 'metaDescription', e.target.value)} className="h-24" /></div>
            </div>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{post?.index === -1 ? 'Add New Blog Post' : 'Edit Blog Post'}</DialogTitle>
                    <DialogDescription>Make changes to your post here. Click save when you're done.</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="md:col-span-2">
                         <Tabs defaultValue="en">
                            <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="en">English</TabsTrigger><TabsTrigger value="bn">Bengali</TabsTrigger></TabsList>
                            <TabsContent value="en" className="pt-4">{renderFormFields('en')}</TabsContent>
                            <TabsContent value="bn" className="pt-4">{renderFormFields('bn')}</TabsContent>
                        </Tabs>
                    </div>
                    <div className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><ImageIcon className="h-5 w-5"/>Featured Image</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                <div className="relative w-full aspect-video border rounded-md overflow-hidden bg-muted">
                                    {uploadingImage ? <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div> : <Image src={formData.en.image} alt="Post image" layout="fill" objectFit="cover" unoptimized />}
                                </div>
                                <Input id="image" type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }} disabled={uploadingImage} />
                                <div className="space-y-1 pt-2">
                                  <Label>Image AI Hint (for alt text generation)</Label>
                                  <Input value={formData.en.imageHint} onChange={e => { handleFieldChange('en', 'imageHint', e.target.value); handleFieldChange('bn', 'imageHint', e.target.value); }} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleSubmit}>Save Post</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

