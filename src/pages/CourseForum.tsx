import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useForumPosts, useCreateForumPost, useUpvotePost, ForumPost } from "@/hooks/useForumPosts";
import { useForumReplies, useCreateForumReply, useMarkAsAnswer } from "@/hooks/useForumReplies";
import { useForumRealtime, useTypingIndicator } from "@/hooks/useForumRealtime";
import { useCheckAndAwardAchievements } from "@/hooks/useAchievements";
import { useCourses } from "@/hooks/useCourses";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TypingIndicator } from "@/components/forum/TypingIndicator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  ThumbsUp,
  CheckCircle,
  Clock,
  Plus,
  Search,
  ChevronRight,
  MessageCircle,
  Loader2,
  Send,
  Radio,
} from "lucide-react";

type SortOption = "recent" | "upvoted" | "unanswered";
type StatusFilter = "all" | "answered" | "unanswered";

const CourseForum = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: posts = [], isLoading } = useForumPosts();
  const { data: courses = [] } = useCourses();
  const createPost = useCreateForumPost();
  const upvotePost = useUpvotePost();
  const checkAchievements = useCheckAndAwardAchievements();

  const [selectedCourse, setSelectedCourse] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedThread, setSelectedThread] = useState<ForumPost | null>(null);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCourse, setNewPostCourse] = useState<string>("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Enable realtime updates
  useForumRealtime(selectedThread?.id);

  const filteredPosts = posts
    .filter((post) => {
      if (selectedCourse !== "all" && post.course_id !== selectedCourse) return false;
      if (statusFilter === "answered" && post.status !== "answered") return false;
      if (statusFilter === "unanswered" && post.status === "answered") return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "upvoted":
          return (b.upvotes || 0) - (a.upvotes || 0);
        case "unanswered":
          return a.status === b.status ? 0 : a.status === "answered" ? 1 : -1;
        case "recent":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleCreatePost = async () => {
    await createPost.mutateAsync({
      title: newPostTitle,
      content: newPostContent,
      courseId: newPostCourse || undefined,
    });
    setNewPostTitle("");
    setNewPostContent("");
    setNewPostCourse("");
    setCreateDialogOpen(false);
    // Check for achievements after creating a post
    checkAchievements.mutate();
  };

  const handleUpvote = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate("/auth");
      return;
    }
    await upvotePost.mutateAsync(postId);
  };

  if (selectedThread) {
    return (
      <DashboardLayout>
        <ThreadDetail
          thread={selectedThread}
          onBack={() => setSelectedThread(null)}
          user={user}
          formatTimeAgo={formatTimeAgo}
        />
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top Filters Bar */}
        <div className="flex flex-wrap items-center gap-4">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            {[
              { value: "all", label: "All" },
              { value: "answered", label: "Answered" },
              { value: "unanswered", label: "Unanswered" },
            ].map((filter) => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(filter.value as StatusFilter)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Course Forum</h1>
              <p className="text-muted-foreground">Discuss courses with fellow learners</p>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => !user && navigate("/auth")}>
                  <Plus className="w-4 h-4 mr-2" /> New Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Post</DialogTitle>
                  <DialogDescription>Ask a question or start a discussion</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      placeholder="What's your question?"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Course (optional)</Label>
                    <Select value={newPostCourse} onValueChange={setNewPostCourse}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Content</Label>
                    <Textarea
                      placeholder="Describe your question in detail..."
                      rows={6}
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleCreatePost}
                    disabled={!newPostTitle || !newPostContent || createPost.isPending}
                  >
                    {createPost.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Post Question
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search & Sort */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search discussions..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="upvoted">Most Upvoted</SelectItem>
                <SelectItem value="unanswered">Unanswered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Thread List */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No discussions found.</p>
              <p className="text-sm text-muted-foreground mt-2">Be the first to start a conversation!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  className="hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedThread(post)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={post.author?.avatar_url || undefined} />
                        <AvatarFallback>{post.author?.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground truncate">
                                {post.title}
                              </h3>
                              {post.status === "answered" && (
                                <Badge variant="default" className="gap-1">
                                  <CheckCircle className="w-3 h-3" /> Answered
                                </Badge>
                              )}
                              {post.is_pinned && (
                                <Badge variant="secondary">Pinned</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {post.content}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{post.author?.name || "Anonymous"}</span>
                          {post.course && (
                            <Badge variant="outline" className="text-xs">
                              {post.course.title}
                            </Badge>
                          )}
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> {post.replies_count || 0}
                          </span>
                          <button 
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                            onClick={(e) => handleUpvote(post.id, e)}
                          >
                            <ThumbsUp className="w-3 h-3" /> {post.upvotes || 0}
                          </button>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatTimeAgo(post.updated_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

function ThreadDetail({
  thread,
  onBack,
  user,
  formatTimeAgo,
}: {
  thread: ForumPost;
  onBack: () => void;
  user: any;
  formatTimeAgo: (timestamp: string) => string;
}) {
  const navigate = useNavigate();
  const { data: replies = [], isLoading } = useForumReplies(thread.id);
  const createReply = useCreateForumReply();
  const markAsAnswer = useMarkAsAnswer();

  const [replyContent, setReplyContent] = useState("");

  const handleSubmitReply = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    await createReply.mutateAsync({ postId: thread.id, content: replyContent });
    setReplyContent("");
  };

  const handleMarkAsAnswer = async (replyId: string) => {
    await markAsAnswer.mutateAsync({ replyId, postId: thread.id });
  };

  return (
    <div className="max-w-4xl">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        ← Back to Forum
      </Button>

      {/* Original Post */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={thread.author?.avatar_url || undefined} />
              <AvatarFallback>{thread.author?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground mb-1">{thread.title}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{thread.author?.name || "Anonymous"}</span>
                <span>•</span>
                <span>{formatTimeAgo(thread.created_at)}</span>
                {thread.course && (
                  <Badge variant="outline">{thread.course.title}</Badge>
                )}
                {thread.status === "answered" && (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="w-3 h-3" /> Answered
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <p className="text-foreground leading-relaxed mb-4 whitespace-pre-wrap">{thread.content}</p>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <ThumbsUp className="w-4 h-4 mr-1" /> {thread.upvotes || 0}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Replies Section */}
      <div className="space-y-4 mb-6">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : replies.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No replies yet. Be the first to respond!
            </CardContent>
          </Card>
        ) : (
          replies.map((reply) => (
            <Card
              key={reply.id}
              className={reply.is_answer ? "border-green-500 bg-green-500/5" : ""}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={reply.author?.avatar_url || undefined} />
                    <AvatarFallback>{reply.author?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{reply.author?.name || "Anonymous"}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(reply.created_at)}
                      </span>
                      {reply.is_answer && (
                        <Badge variant="default" className="gap-1 bg-green-600">
                          <CheckCircle className="w-3 h-3" /> Accepted Answer
                        </Badge>
                      )}
                    </div>
                    <p className="text-foreground whitespace-pre-wrap mb-3">{reply.content}</p>
                    <div className="flex items-center gap-2">
                      {user && user.id === thread.author_id && !reply.is_answer && thread.status !== "answered" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsAnswer(reply.id)}
                          disabled={markAsAnswer.isPending}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Mark as Answer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reply Form */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <Label>Your Reply</Label>
            <Textarea
              placeholder={user ? "Write your reply..." : "Sign in to reply"}
              rows={4}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              disabled={!user}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitReply}
                disabled={!replyContent.trim() || createReply.isPending || !user}
              >
                {createReply.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Post Reply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CourseForum;
