import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, UserPlus, Mail, Ban, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

const mockUsers = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "Student", status: "Active", enrolledCourses: 5, joinDate: "2024-01-15" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "Student", status: "Active", enrolledCourses: 3, joinDate: "2024-02-20" },
  { id: "3", name: "Dr. Sarah Chen", email: "sarah@example.com", role: "Instructor", status: "Active", enrolledCourses: 0, joinDate: "2023-06-10" },
  { id: "4", name: "Mike Johnson", email: "mike@example.com", role: "Student", status: "Suspended", enrolledCourses: 2, joinDate: "2024-03-05" },
  { id: "5", name: "Emily Watson", email: "emily@example.com", role: "Instructor", status: "Active", enrolledCourses: 0, joinDate: "2023-08-15" },
  { id: "6", name: "Alex Brown", email: "alex@example.com", role: "Student", status: "Active", enrolledCourses: 8, joinDate: "2023-12-01" },
  { id: "7", name: "Lisa Park", email: "lisa@example.com", role: "Admin", status: "Active", enrolledCourses: 0, joinDate: "2023-01-01" },
];

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState(mockUsers);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSuspendUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: u.status === "Suspended" ? "Active" : "Suspended" } : u))
    );
    toast.success("User status updated");
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    toast.success("User deleted");
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">User Management</h1>
        <p className="text-muted-foreground">Manage user accounts and permissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-emerald-500">{users.filter((u) => u.status === "Active").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Suspended</p>
            <p className="text-2xl font-bold text-rose-500">{users.filter((u) => u.status === "Suspended").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Instructors</p>
            <p className="text-2xl font-bold text-blue-500">{users.filter((u) => u.role === "Instructor").length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enrolled Courses</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "Admin" ? "default" : user.role === "Instructor" ? "secondary" : "outline"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "Active" ? "default" : "destructive"} className="gap-1">
                      {user.status === "Active" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.enrolledCourses}</TableCell>
                  <TableCell>{user.joinDate}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSuspendUser(user.id)}>
                          <Ban className="w-4 h-4 mr-2" />
                          {user.status === "Suspended" ? "Activate" : "Suspend"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteUser(user.id)}>
                          <XCircle className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default UserManagement;
