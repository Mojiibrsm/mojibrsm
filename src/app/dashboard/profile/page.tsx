
'use client';

import { useAuth } from '@/contexts/auth-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const profileFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  bio: z.string().max(200, 'Bio cannot be longer than 200 characters').optional(),
});

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: '',
      bio: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.displayName || '',
        bio: 'I am a passionate developer and designer.', // This is now static
      });
    }
  }, [user, form]);


  async function onSubmit(data: z.infer<typeof profileFormSchema>) {
    setIsSubmitting(true);
    
    // Simulate an API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // With Firebase Auth removed, we just show a toast message.
    // In a real app with a backend, you'd make an API call here.
    toast({
      title: 'প্রোফাইল আপডেট হয়েছে',
      description: 'আপনার প্রোফাইলের তথ্য সফলভাবে আপডেট করা হয়েছে (সিমুলেশন)।',
    });
    
    setIsSubmitting(false);
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and profile information.</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
             <Avatar className="h-20 w-20">
              <AvatarImage src={user.photoURL || ''} alt={user?.displayName || 'User'} />
              <AvatarFallback>{user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <h2 className="text-xl font-semibold">{user?.displayName || 'New User'}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground pt-2">This is static profile information.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Your full name" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={user.phoneNumber || ''} disabled className="pl-10" />
                </div>
              </FormItem>
              
              {user.email && (
                 <FormItem>
                    <FormLabel>Email Address</FormLabel>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input value={user.email} disabled className="pl-10" />
                      </div>
                  </FormItem>
              )}

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell us a little bit about yourself" className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                 {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
