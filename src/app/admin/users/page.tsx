
'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ShieldCheck, UserCog, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUsers, FirestoreUser, updateUserRole } from '@/services/firestore';
import { useAuth } from '@/contexts/auth-context';

const getRoleVariant = (role: string) => {
  switch (role) {
    case 'Admin': return 'default';
    case 'Client': return 'secondary';
    default: return 'outline';
  }
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const { toast } = useToast();
  const { user: adminUser } = useAuth();

  useEffect(() => {
    const unsubscribe = getUsers((fetchedUsers: FirestoreUser[]) => {
      setUsers(fetchedUsers);
    });

    return () => unsubscribe();
  }, []);

  const handleRoleChange = async (userId: string, newRole: 'Admin' | 'Client') => {
    if (userId === adminUser?.uid && newRole === 'Client') {
        toast({
            variant: "destructive",
            title: "Action Forbidden",
            description: "You cannot remove your own admin role."
        });
        return;
    }

    try {
        await updateUserRole(userId, newRole);
        toast({
          title: "User Role Updated",
          description: `User's role has been changed to ${newRole}.`
        });
    } catch (error) {
         toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update user role."
        });
    }
  };

  const handleSuspendUser = (userId: string, userName: string) => {
    // In a real app, this would make an API call to disable the user in Firebase Auth.
    // This requires a backend (like Cloud Functions) to manage user auth state.
    console.log(`Suspending user ${userId}`);
    toast({
      variant: "destructive",
      title: "User Suspended (Simulation)",
      description: `${userName} has been suspended. This is a UI simulation.`,
    });
  };
  
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <p className="text-muted-foreground">View and manage all registered users from the database.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>A list of all users who have an account.</CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No users found in the database.
                    </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                          <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.displayName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleVariant(user.role) as any}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>{user.createdAt?.toDate().toLocaleDateString() || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleRoleChange(user.uid, 'Admin')}>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRoleChange(user.uid, 'Client')}>
                            <UserCog className="mr-2 h-4 w-4" />
                            Make Client
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleSuspendUser(user.uid, user.displayName || 'User')}>
                            <UserX className="mr-2 h-4 w-4" />
                            Suspend User
                          </DropdownMenuItem>
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
    </div>
  )
}
