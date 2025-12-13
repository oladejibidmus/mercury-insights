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
import { AlertTriangle, CheckCircle, XCircle, Flag, MessageSquare, Eye, Search, MoreVertical, Pin, Lock, Trash2, ThumbsUp, Clock, Loader2 } from "lucide-react";
import { useAdminForumPosts } from "@/hooks/useAdminForumPosts";
import { format } from "date-fns";

const ContentModeration = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");

  const { posts, isLoading, updatePostStatus, togglePinPost, deletePost } = useAdminForumPosts();

  const filteredPosts = posts.filter((post) => {
    const matchesTab = activeTab === "all" || 
      (activeTab === "flagged" && post.status === "flagged") ||
      (activeTab === "open" && post.status === "open") ||
      (activeTab === "answered" && post.status === "answered");
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.author_name?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesCourse = courseFilter === "all" || post.course_title === courseFilter;
    return matchesTab && matchesSearch && matchesCourse;
  });

  const handlePinPost = (post: typeof posts[0]) => {
    togglePinPost.mutate({ id: post.id, isPinned: post.is_pinned || false });
  };

  const handleClosePost = (id: string) => {
    updatePostStatus.mutate({ id, status: "closed" });
  };

  const handleApprovePost = (id: string) => {
    updatePostStatus.mutate({ id, status: "open" });
  };

  const handleDeletePost = (id: string) => {
    deletePost.mutate(id);
  };

  const flaggedCount = posts.filter((p) => p.status === "flagged").length;
  const unansweredCount = posts.filter((p) => p.status === "open").length;

  const uniqueCourses = [...new Set(posts.map((p) => p.course_title).filter(Boolean))];

  const getLastActivity = (updatedAt: string) => {
    try {
      const date = new Date(updatedAt);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
      return `${Math.floor(diffMins / 1440)} days ago`;
    } catch {
      return "Unknown";
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

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
                <p className="text-2xl font-bold">—</p>
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
              <SelectItem key={course} value={course!}>{course}</SelectItem>
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
                            {post.is_pinned && <Pin className="w-4 h-4 text-primary mt-1" />}
                            <div>
                              <p className="font-medium line-clamp-1">{post.title}</p>
                              <p className="text-sm text-muted-foreground">{post.author_name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{post.course_title || "General"}</Badge>
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
                        <TableCell>{post.replies_count || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4 text-muted-foreground" />
                            {post.upvotes || 0}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{getLastActivity(post.updated_at)}</TableCell>
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
                              <DropdownMenuItem onClick={() => handlePinPost(post)}>
                                <Pin className="w-4 h-4 mr-2" />
                                {post.is_pinned ? "Unpin" : "Pin"} Post
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
    </AdminLayout>
  );
};

export default ContentModeration;