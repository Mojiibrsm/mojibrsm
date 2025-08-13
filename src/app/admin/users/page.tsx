
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminUsersPage() {
  const firebaseConsoleUrl = `https://console.firebase.google.com/project/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/authentication/users`;

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <p className="text-muted-foreground">Manage admin users in your Firebase project console.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>User management is handled by Firebase Authentication.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
              <ShieldAlert className="h-12 w-12 mb-4" />
              <p className="font-semibold">User management is handled in Firebase.</p>
              <p className="text-sm mt-1 max-w-md mx-auto">To add, remove, or change passwords for admin users, please go to the Firebase console.</p>
               <Button asChild className="mt-6">
                    <Link href={firebaseConsoleUrl} target="_blank" rel="noopener noreferrer">
                        Go to Firebase Console
                    </Link>
                </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
