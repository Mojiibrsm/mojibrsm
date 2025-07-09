
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Pencil, Trash2, Loader2, Save, Image as ImageIcon, Bold, Italic, Strikethrough, List, ListOrdered, Quote, Underline, Palette, ImagePlus, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { translations } from '@/lib/translations';
import { updateBlogPosts } from './actions';
import { addMediaItem } from '@/services/data';
import Image from 'next/image';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapUnderline from '@tiptap/extension-underline';
import { Color as TiptapColor } from '@tiptap/extension-color';
import TiptapTextStyle from '@tiptap/extension-text-style';
import TiptapImage from '@tiptap/extension-image';

type Post = (typeof translations.en.blog.posts)[0];
type EditablePost = { post: Post; index: number };

const newPostTemplate: Post = { slug: 'new-post-slug', title: 'New Blog Post', excerpt: 'A short excerpt for the new post.', content: '<p>Start writing your amazing blog content here!</p>', image: 'https://placehold.co/800x400.png', imageHint: 'blog post', date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), tags: ['New Tag'], metaTitle: 'New Post Meta Title', metaDescription: 'New post meta description for SEO.' };

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
            post: { ...newPostTemplate, slug: uniqueSlug },
            index: -1,
        });
        setIsDialogOpen(true);
    };

    const handleEdit = (index: number) => {
        setEditingPost({
            post: posts.en[index],
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
        const { post, index } = data;
        
        if (index === -1) { // New post
            setPosts(prev => ({
                en: [post, ...prev.en],
                bn: [post, ...prev.bn],
            }));
        } else { // Editing existing post
            setPosts(prev => {
                const newEn = [...prev.en];
                const newBn = [...prev.bn];
                newEn[index] = post;
                newBn[index] = post;
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
                                <TableHead>Title</TableHead>
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

// --- Tiptap Editor Components ---
const TiptapToolbar = ({ editor }: { editor: Editor | null }) => {
  const { toast } = useToast();

  const addImage = useCallback(() => {
    if (!editor) return;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    fileInput.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
            document.body.removeChild(fileInput);
            return;
        }

        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('destination', 's3');

        toast({ title: "Uploading image..." });
        
        try {
            const response = await fetch('/api/upload', { method: 'POST', body: uploadFormData });
            const result = await response.json();
            if (response.ok && result.success) {
                editor.chain().focus().setImage({ src: result.url, alt: file.name }).run();
                addMediaItem({ url: result.url, name: file.name });
                toast({ title: "Image Uploaded", description: "Image inserted into content." });
            } else {
                throw new Error(result.message || 'Upload failed');
            }
        } catch (error: any) {
            toast({ title: "Upload Error", description: error.message, variant: "destructive" });
        } finally {
            document.body.removeChild(fileInput);
        }
    };
    
    document.body.appendChild(fileInput);
    fileInput.click();
  }, [editor, toast]);


  if (!editor) {
    return null;
  }

  const ToggleButton = ({ onClick, children, isActive }: { onClick: () => void, children: React.ReactNode, isActive: boolean }) => (
    <Button
      type="button"
      size="icon"
      variant={isActive ? "secondary" : "ghost"}
      onClick={onClick}
      className="h-8 w-8"
      aria-pressed={isActive}
    >
      {children}
    </Button>
  );

  return (
    <div className="p-2 border-b flex items-center flex-wrap gap-1">
      <ToggleButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}><Bold className="h-4 w-4" /></ToggleButton>
      <ToggleButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}><Italic className="h-4 w-4" /></ToggleButton>
      <ToggleButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')}><Underline className="h-4 w-4" /></ToggleButton>
      <ToggleButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')}><Strikethrough className="h-4 w-4" /></ToggleButton>
      <div className="relative inline-flex items-center justify-center h-8 w-8">
          <input
            type="color"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onInput={event => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
            value={editor.getAttributes('textStyle').color || '#000000'}
            title="Text Color"
          />
          <Palette className="h-4 w-4 text-muted-foreground" style={{ color: editor.getAttributes('textStyle').color }} />
      </div>
      <ToggleButton onClick={addImage} isActive={false}><ImagePlus className="h-4 w-4" /></ToggleButton>
      <ToggleButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}><List className="h-4 w-4" /></ToggleButton>
      <ToggleButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}><ListOrdered className="h-4 w-4" /></ToggleButton>
      <ToggleButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')}><Quote className="h-4 w-4" /></ToggleButton>
    </div>
  );
};

const TiptapEditor = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({ link: false }),
            TiptapUnderline,
            TiptapTextStyle,
            TiptapColor,
            TiptapImage.configure({
                allowBase64: true,
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none px-4 py-2',
            },
        },
    });

    return (
        <div className="border rounded-md bg-background">
            <TiptapToolbar editor={editor} />
            <EditorContent editor={editor} className="min-h-[256px]"/>
        </div>
    );
};

// --- Blog Post Form Dialog ---
function PostFormDialog({ isOpen, onOpenChange, onSave, post }: { isOpen: boolean; onOpenChange: (open: boolean) => void; onSave: (data: EditablePost) => void; post: EditablePost | null; }) {
    const [formData, setFormData] = useState<EditablePost | null>(post ? JSON.parse(JSON.stringify(post)) : null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFieldChange = (field: keyof Post, value: string | string[]) => {
        if (!formData) return;
        setFormData(prev => {
            if (!prev) return null;
            const newPost = { ...prev.post, [field]: value };
            return { ...prev, post: newPost };
        });
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
                handleFieldChange('image', result.url);
                addMediaItem({ name: file.name, url: result.url });
                toast({ title: "Image Uploaded", description: "Featured image has been updated." });
            } else {
                throw new Error(result.message || 'Upload failed');
            }
        } catch (error: any) {
            toast({ title: "Upload Error", description: error.message, variant: "destructive" });
        } finally {
            setUploadingImage(false);
        }
    };
    
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImageUpload(file);
        }
    };

    const handleSubmit = () => {
        if(formData) onSave(formData);
    };
    
    if(!formData) return null;
    const data = formData.post;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>{post?.index === -1 ? 'Add New Blog Post' : 'Edit Blog Post'}</DialogTitle>
                    <DialogDescription>Make changes to your post here. Click save when you're done.</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="md:col-span-2 space-y-4">
                        <div className="space-y-1"><Label>Slug (URL Identifier)</Label><Input value={data.slug} onChange={e => handleFieldChange('slug', e.target.value)} /><p className="text-xs text-muted-foreground">Keep this unique.</p></div>
                        <div className="space-y-1"><Label>Title</Label><Input value={data.title} onChange={e => handleFieldChange('title', e.target.value)} /></div>
                        <div className="space-y-1"><Label>Date</Label><Input value={data.date} onChange={e => handleFieldChange('date', e.target.value)} /></div>
                        <div className="space-y-1"><Label>Excerpt</Label><Textarea value={data.excerpt} onChange={e => handleFieldChange('excerpt', e.target.value)} className="h-24" /></div>
                        <div className="space-y-1">
                            <Label>Content</Label>
                            <TiptapEditor
                                value={data.content}
                                onChange={(content) => handleFieldChange('content', content)}
                            />
                        </div>
                        <div className="space-y-1"><Label>Tags (comma separated)</Label><Input value={data.tags.join(', ')} onChange={e => handleFieldChange('tags', e.target.value.split(',').map(t => t.trim()))} /></div>
                        <div className="space-y-1"><Label>Meta Title (for SEO)</Label><Input value={data.metaTitle} onChange={e => handleFieldChange('metaTitle', e.target.value)} /></div>
                        <div className="space-y-1"><Label>Meta Description (for SEO)</Label><Textarea value={data.metaDescription} onChange={e => handleFieldChange('metaDescription', e.target.value)} className="h-24" /></div>
                    </div>
                    <div className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><ImageIcon className="h-5 w-5"/>Featured Image</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                <div className="relative w-full aspect-video border rounded-md overflow-hidden bg-muted">
                                    {uploadingImage ? <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div> : <Image src={data.image} alt="Post image" layout="fill" objectFit="cover" unoptimized />}
                                </div>
                                <Button className="w-full" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    {uploadingImage ? 'Uploading...' : 'Change Image'}
                                </Button>
                                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileSelect} className="hidden" />
                                <div className="space-y-1 pt-2">
                                  <Label>Image AI Hint (for alt text generation)</Label>
                                  <Input value={data.imageHint} onChange={e => handleFieldChange('imageHint', e.target.value)} />
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
