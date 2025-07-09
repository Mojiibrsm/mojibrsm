
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <p className="text-muted-foreground">View and manage all registered users from the database.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>User Management Disabled</CardTitle>
          <CardDescription>This feature is not available with the current login system.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12">
              <ShieldAlert className="h-12 w-12 mb-4" />
              <p className="font-semibold">Multi-user management is not supported.</p>
              <p className="text-sm mt-1">The current simple password login system does not support different user roles or accounts. All data is managed under a single admin identity.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
