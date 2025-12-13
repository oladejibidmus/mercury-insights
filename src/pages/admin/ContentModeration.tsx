import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertTriangle, CheckCircle, XCircle, Flag, MessageSquare, Eye, Search, MoreVertical, Pin, Lock, Trash2, Ban, ThumbsUp, Clock } from "lucide-react";
import { toast } from "sonner";

interface ForumPost {
  id: string;
  title: string;
  author: string;
  course: string;
  content: string;
  replies: number;
  status: "open" | "answered" | "flagged" | "closed";
  lastActivity: string;
  upvotes: number;
  isPinned: boolean;
}

const mockPosts: ForumPost[] = [
  { id: "1", title: "How to handle null values in Python pandas?", author: "john@example.com", course: "Python for Data Science", content: "I'm having trouble with NaN values in my dataset...", replies: 12, status: "answered", lastActivity: "2 hours ago", upvotes: 24, isPinned: false },
  { id: "2", title: "SPAM: Check out my website for free courses!", author: "spammer123", course: "SQL Bootcamp", content: "This is spam content promoting external links...", replies: 0, status: "flagged", lastActivity: "1 hour ago", upvotes: 0, isPinned: false },
  { id: "3", title: "Best practices for SQL query optimization", author: "sarah@example.com", course: "SQL Bootcamp", content: "Looking for tips on optimizing complex queries...", replies: 8, status: "open", lastActivity: "30 min ago", upvotes: 15, isPinned: true },
  { id: "4", title: "Inappropriate comment in discussion", author: "user456", course: "Tableau Expert", content: "This post contains inappropriate language...", replies: 3, status: "flagged", lastActivity: "4 hours ago", upvotes: 2, isPinned: false },
  { id: "5", title: "Tableau vs Power BI - which to learn first?", author: "emily@example.com", course: "Tableau Expert", content: "I want to start learning visualization tools...", replies: 25, status: "answered", lastActivity: "1 day ago", upvotes: 42, isPinned: false },
  { id: "6", title: "Misleading course information reported", author: "alex@example.com", course: "Power BI Complete", content: "The course description says it covers X but...", replies: 5, status: "flagged", lastActivity: "3 hours ago", upvotes: 8, isPinned: false },
];

const ContentModeration = () => {
  const [posts, setPosts] = useState(mockPosts);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");

  const filteredPosts = posts.filter((post) => {
    const matchesTab = activeTab === "all" || 
      (activeTab === "flagged" && post.status === "flagged") ||
      (activeTab === "open" && post.status === "open") ||
      (activeTab === "answered" && post.status === "answered");
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = courseFilter === "all" || post.course === courseFilter;
    return matchesTab && matchesSearch && matchesCourse;
  });

  const handlePinPost = (id: string) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, isPinned: !p.isPinned } : p)));
    toast.success("Post pin status updated");
  };

  const handleClosePost = (id: string) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: "closed" as const } : p)));
    toast.success("Post closed");
  };

  const handleDeletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Post deleted");
  };

  const handleApprovePost = (id: string) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: "open" as const } : p)));
    toast.success("Post approved");
  };

  const handleBanUser = (author: string) => {
    toast.success(`User ${author} has been banned`);
  };

  const flaggedCount = posts.filter((p) => p.status === "flagged").length;
  const unansweredCount = posts.filter((p) => p.status === "open").length;

  const uniqueCourses = [...new Set(posts.map((p) => p.course))];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Forum Moderation</h1>
        <p className="text-muted-foreground">Manage forum posts and moderate content</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <MessageSquare className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{posts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">2.4h</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/10">
                <Flag className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Flagged Posts</p>
                <p className="text-2xl font-bold">{flaggedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <AlertTriangle className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unanswered</p>
                <p className="text-2xl font-bold">{unansweredCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search posts by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {uniqueCourses.map((course) => (
              <SelectItem key={course} value={course}>{course}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Posts</TabsTrigger>
          <TabsTrigger value="flagged" className="gap-2">
            Flagged
            {flaggedCount > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                {flaggedCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="open">Unanswered</TabsTrigger>
          <TabsTrigger value="answered">Answered</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Post</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Replies</TableHead>
                    <TableHead>Upvotes</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No posts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPosts.map((post) => (
                      <TableRow key={post.id} className={post.status === "flagged" ? "bg-destructive/5" : ""}>
                        <TableCell>
                          <div className="flex items-start gap-2">
                            {post.isPinned && <Pin className="w-4 h-4 text-primary mt-1" />}
                            <div>
                              <p className="font-medium line-clamp-1">{post.title}</p>
                              <p className="text-sm text-muted-foreground">{post.author}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{post.course}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              post.status === "answered" ? "default" : 
                              post.status === "flagged" ? "destructive" : 
                              post.status === "closed" ? "secondary" : 
                              "outline"
                            }
                            className="gap-1"
                          >
                            {post.status === "answered" && <CheckCircle className="w-3 h-3" />}
                            {post.status === "flagged" && <Flag className="w-3 h-3" />}
                            {post.status === "closed" && <Lock className="w-3 h-3" />}
                            {post.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{post.replies}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4 text-muted-foreground" />
                            {post.upvotes}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{post.lastActivity}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Post
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePinPost(post.id)}>
                                <Pin className="w-4 h-4 mr-2" />
                                {post.isPinned ? "Unpin" : "Pin"} Post
                              </DropdownMenuItem>
                              {post.status === "flagged" && (
                                <DropdownMenuItem onClick={() => handleApprovePost(post.id)}>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve Post
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleClosePost(post.id)}>
                                <Lock className="w-4 h-4 mr-2" />
                                Close Post
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleBanUser(post.author)}>
                                <Ban className="w-4 h-4 mr-2" />
                                Ban User
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDeletePost(post.id)}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Post
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
        </TabsContent>
      </Tabs>

      {/* Top Contributors */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Top Forum Contributors</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Dr. Sarah Chen", posts: 45, helpful: 32 },
              { name: "Alex Brown", posts: 35, helpful: 28 },
              { name: "Emily Watson", posts: 20, helpful: 15 },
            ].map((user, index) => (
              <div key={user.name} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.posts} posts • {user.helpful} helpful</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default ContentModeration;