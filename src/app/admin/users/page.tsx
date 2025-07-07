
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
import { getUsers, FirestoreUser } from '@/services/firestore';

type User = {
    uid: string;
    name: string;
    email: string;
    role: 'Admin' | 'Client';
    joinDate: string;
    avatar: string;
};

const getRoleVariant = (role: string) => {
  switch (role) {
    case 'Admin': return 'default';
    case 'Client': return 'secondary';
    default: return 'outline';
  }
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = getUsers((fetchedUsers: FirestoreUser[]) => {
      const formattedUsers: User[] = fetchedUsers.map(u => ({
        uid: u.uid,
        name: u.displayName || 'No Name Provided',
        email: u.email || 'No Email Provided',
        role: u.role || 'Client',
        joinDate: u.createdAt?.toDate().toLocaleDateString() || 'N/A',
        avatar: u.photoURL || '',
      }));
      setUsers(formattedUsers);
    });

    return () => unsubscribe();
  }, []);

  const handleRoleChange = (userId: string, newRole: 'Admin' | 'Client') => {
    // In a real app, you would call a Firestore update function here.
    // For now, this is a UI-only simulation.
    setUsers(users.map(u => u.uid === userId ? { ...u, role: newRole } : u));
    toast({
      title: "User Role Updated (Simulation)",
      description: `User's role has been changed to ${newRole}. This is a simulation and not saved to the database yet.`
    });
  };

  const handleSuspendUser = (userId: string, userName: string) => {
    // In a real app, this would make an API call to disable the user in Firebase Auth.
    console.log(`Suspending user ${userId}`);
    toast({
      variant: "destructive",
      title: "User Suspended (Simulation)",
      description: `${userName} has been suspended. This is a simulation.`,
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
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleVariant(user.role) as any}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>{user.joinDate}</TableCell>
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
                          <DropdownMenuItem className="text-destructive" onClick={() => handleSuspendUser(user.uid, user.name)}>
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
