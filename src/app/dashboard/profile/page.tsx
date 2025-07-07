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
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, Lock, Upload } from 'lucide-react';

const profileFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  bio: z.string().max(200, 'Bio cannot be longer than 200 characters').optional(),
});

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.displayName || '',
      email: user?.email || '',
      phoneNumber: '',
      bio: 'I am a passionate developer and designer.',
    },
  });

  function onSubmit(data: z.infer<typeof profileFormSchema>) {
    // Here you would typically call an API to update the user profile
    console.log(data);
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been successfully updated.',
    });
  }

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
              <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
              <AvatarFallback>{user?.displayName?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <h2 className="text-xl font-semibold">{user?.displayName}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Button size="sm" variant="outline" className="mt-2">
                <Upload className="mr-2 h-4 w-4" />
                Change Picture
              </Button>
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
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="your.email@example.com" {...field} disabled />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <Button type="submit">Save Changes</Button>
            </form>
          </Form>

          <Separator className="my-8" />

          <div>
             <h3 className="text-lg font-medium">Change Password</h3>
             <p className="text-sm text-muted-foreground">
                For security, you will be logged out after changing your password.
             </p>
             <Button variant="outline" className="mt-4">
                <Lock className="mr-2 h-4 w-4"/>
                Change Password
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
