import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MoreVertical, UserPlus, Mail, Ban, CheckCircle, XCircle, Eye, Download, Key, Clock, BookOpen, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: "Learner" | "Admin";
  status: "Active" | "Suspended";
  enrolledCourses: number;
  completedCourses: number;
  joinDate: string;
  lastActive: string;
  avatar?: string;
  quizScores: number;
  forumPosts: number;
}

const mockUsers: User[] = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "Learner", status: "Active", enrolledCourses: 5, completedCourses: 2, joinDate: "2024-01-15", lastActive: "2 hours ago", quizScores: 85, forumPosts: 12 },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "Learner", status: "Active", enrolledCourses: 3, completedCourses: 1, joinDate: "2024-02-20", lastActive: "1 day ago", quizScores: 92, forumPosts: 8 },
  { id: "3", name: "Dr. Sarah Chen", email: "sarah@example.com", role: "Learner", status: "Active", enrolledCourses: 8, completedCourses: 6, joinDate: "2023-06-10", lastActive: "5 min ago", quizScores: 95, forumPosts: 45 },
  { id: "4", name: "Mike Johnson", email: "mike@example.com", role: "Learner", status: "Suspended", enrolledCourses: 2, completedCourses: 0, joinDate: "2024-03-05", lastActive: "1 week ago", quizScores: 62, forumPosts: 2 },
  { id: "5", name: "Emily Watson", email: "emily@example.com", role: "Learner", status: "Active", enrolledCourses: 4, completedCourses: 3, joinDate: "2023-08-15", lastActive: "3 hours ago", quizScores: 88, forumPosts: 20 },
  { id: "6", name: "Alex Brown", email: "alex@example.com", role: "Learner", status: "Active", enrolledCourses: 8, completedCourses: 5, joinDate: "2023-12-01", lastActive: "Just now", quizScores: 78, forumPosts: 35 },
  { id: "7", name: "Lisa Park", email: "lisa@example.com", role: "Admin", status: "Active", enrolledCourses: 0, completedCourses: 0, joinDate: "2023-01-01", lastActive: "10 min ago", quizScores: 0, forumPosts: 5 },
];

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState(mockUsers);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role.toLowerCase() === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

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

  const handleResetPassword = (userId: string) => {
    toast.success("Password reset email sent");
  };

  const viewUserDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  const handleExportUsers = () => {
    toast.success("Users exported to CSV");
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
            <p className="text-sm text-muted-foreground">Admins</p>
            <p className="text-2xl font-bold text-blue-500">{users.filter((u) => u.role === "Admin").length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="learner">Learner</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleExportUsers}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
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
                <TableHead>Enrolled</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "Admin" ? "default" : "outline"}>
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
                    <span className="text-muted-foreground text-sm">{user.lastActive}</span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewUserDetails(user)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
                          <Key className="w-4 h-4 mr-2" />
                          Reset Password
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

      {/* User Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Profile Info */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar} />
                  <AvatarFallback className="text-lg">{selectedUser.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={selectedUser.role === "Admin" ? "default" : "outline"}>{selectedUser.role}</Badge>
                    <Badge variant={selectedUser.status === "Active" ? "default" : "destructive"}>{selectedUser.status}</Badge>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="learning">
                <TabsList>
                  <TabsTrigger value="learning">Learning History</TabsTrigger>
                  <TabsTrigger value="activity">Forum Activity</TabsTrigger>
                </TabsList>
                <TabsContent value="learning" className="space-y-4 mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <BookOpen className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">{selectedUser.enrolledCourses}</p>
                        <p className="text-sm text-muted-foreground">Enrolled</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <CheckCircle className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                        <p className="text-2xl font-bold">{selectedUser.completedCourses}</p>
                        <p className="text-sm text-muted-foreground">Completed</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{selectedUser.quizScores}%</p>
                        <p className="text-sm text-muted-foreground">Avg Quiz Score</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Joined: {selectedUser.joinDate}</span>
                    <span className="mx-2">•</span>
                    <span>Last active: {selectedUser.lastActive}</span>
                  </div>
                </TabsContent>
                <TabsContent value="activity" className="space-y-4 mt-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <MessageSquare className="w-8 h-8 text-primary" />
                        <div>
                          <p className="text-2xl font-bold">{selectedUser.forumPosts}</p>
                          <p className="text-sm text-muted-foreground">Forum posts & replies</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => handleSuspendUser(selectedUser.id)}>
                  <Ban className="w-4 h-4 mr-2" />
                  {selectedUser.status === "Suspended" ? "Activate" : "Suspend"}
                </Button>
                <Button variant="outline" onClick={() => handleResetPassword(selectedUser.id)}>
                  <Key className="w-4 h-4 mr-2" />
                  Reset Password
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default UserManagement;