'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <p className="text-muted-foreground">View and manage all registered users.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
           <CardDescription>This feature is currently under development.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>The user management system will be available here shortly.</p>
        </CardContent>
      </Card>
    </div>
  )
}
