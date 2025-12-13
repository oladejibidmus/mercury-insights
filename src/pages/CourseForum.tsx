import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { mockForumThreads, forumTopics, forumCourses, ForumThread } from "@/data/forum";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

type SortOption = "recent" | "upvoted" | "unanswered";
type StatusFilter = "all" | "answered" | "unanswered" | "my-posts";

const CourseForum = () => {
  const [selectedCourse, setSelectedCourse] = useState("All Courses");
  const [selectedTopic, setSelectedTopic] = useState("All Topics");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [replyContent, setReplyContent] = useState("");

  const filteredThreads = mockForumThreads
    .filter((thread) => {
      if (selectedCourse !== "All Courses" && thread.courseTitle !== selectedCourse) return false;
      if (selectedTopic !== "All Topics" && thread.topic !== selectedTopic) return false;
      if (statusFilter === "answered" && !thread.isAnswered) return false;
      if (statusFilter === "unanswered" && thread.isAnswered) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          thread.title.toLowerCase().includes(query) ||
          thread.content.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "upvoted":
          return b.upvotes - a.upvotes;
        case "unanswered":
          return a.isAnswered === b.isAnswered ? 0 : a.isAnswered ? 1 : -1;
        case "recent":
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
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

  if (selectedThread) {
    return (
      <DashboardLayout>
        <ThreadDetail
          thread={selectedThread}
          onBack={() => setSelectedThread(null)}
          replyContent={replyContent}
          setReplyContent={setReplyContent}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Course</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {forumCourses.map((course) => (
                      <SelectItem key={course} value={course}>
                        {course}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Topic</Label>
                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {forumTopics.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All" },
                    { value: "answered", label: "Answered" },
                    { value: "unanswered", label: "Unanswered" },
                    { value: "my-posts", label: "My Posts" },
                  ].map((filter) => (
                    <Button
                      key={filter.value}
                      variant={statusFilter === filter.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter(filter.value as StatusFilter)}
                      className="text-xs"
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Course Forum</h1>
              <p className="text-muted-foreground">Discuss courses with fellow learners</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
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
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {forumCourses.slice(1).map((course) => (
                          <SelectItem key={course} value={course}>
                            {course}
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
                  <Button className="w-full">Post Question</Button>
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
          <div className="space-y-3">
            {filteredThreads.map((thread) => (
              <Card
                key={thread.id}
                className="hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => setSelectedThread(thread)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={thread.authorAvatar} />
                      <AvatarFallback>{thread.authorName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground truncate">
                              {thread.title}
                            </h3>
                            {thread.isAnswered && (
                              <Badge variant="default" className="gap-1">
                                <CheckCircle className="w-3 h-3" /> Answered
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {thread.content}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{thread.authorName}</span>
                        <Badge variant="outline" className="text-xs">
                          {thread.courseTitle}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> {thread.replyCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" /> {thread.upvotes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatTimeAgo(thread.lastActivity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredThreads.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No discussions found.</p>
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
  replyContent,
  setReplyContent,
}: {
  thread: ForumThread;
  onBack: () => void;
  replyContent: string;
  setReplyContent: (v: string) => void;
}) {
  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
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
              <AvatarImage src={thread.authorAvatar} />
              <AvatarFallback>{thread.authorName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground mb-1">{thread.title}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{thread.authorName}</span>
                <span>•</span>
                <span>{formatTimeAgo(thread.timestamp)}</span>
                <Badge variant="outline">{thread.courseTitle}</Badge>
                <Badge variant="secondary">{thread.topic}</Badge>
              </div>
            </div>
          </div>
          <p className="text-foreground leading-relaxed mb-4">{thread.content}</p>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <ThumbsUp className="w-4 h-4 mr-1" /> {thread.upvotes}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <h3 className="font-semibold text-foreground mb-4">
        {thread.replies.length} Replies
      </h3>
      <div className="space-y-4 mb-6">
        {thread.replies.map((reply) => (
          <Card
            key={reply.id}
            className={cn(reply.isMarkedAnswer && "border-primary bg-primary/5")}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={reply.authorAvatar} />
                  <AvatarFallback>{reply.authorName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-foreground">{reply.authorName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(reply.timestamp)}
                    </span>
                    {reply.isMarkedAnswer && (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="w-3 h-3" /> Accepted Answer
                      </Badge>
                    )}
                  </div>
                  <p className="text-foreground text-sm leading-relaxed mb-3">{reply.content}</p>
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm">
                      <ThumbsUp className="w-4 h-4 mr-1" /> {reply.upvotes}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reply Form */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium text-foreground mb-3">Post a Reply</h4>
          <Textarea
            placeholder="Share your thoughts or answer..."
            rows={4}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="mb-3"
          />
          <Button>Post Reply</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default CourseForum;
