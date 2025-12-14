import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useForumPosts, useCreateForumPost, useUpvotePost, ForumPost } from "@/hooks/useForumPosts";
import { useForumReplies, useCreateForumReply, useMarkAsAnswer } from "@/hooks/useForumReplies";
import { useCourses } from "@/hooks/useCourses";
import { useAuth } from "@/contexts/AuthContext";
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
  HelpCircle,
  ThumbsUp,
  CheckCircle,
  Clock,
  Plus,
  Search,
  ChevronRight,
  MessageCircle,
  ThumbsDown,
  Loader2,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SortOption = "recent" | "upvoted" | "unanswered";

const QA = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: posts = [], isLoading } = useForumPosts();
  const { data: courses = [] } = useCourses();
  const createPost = useCreateForumPost();
  const upvotePost = useUpvotePost();

  const [selectedCourse, setSelectedCourse] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<ForumPost | null>(null);
  const [newQuestionTitle, setNewQuestionTitle] = useState("");
  const [newQuestionContent, setNewQuestionContent] = useState("");
  const [newQuestionCourse, setNewQuestionCourse] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const qaThreads = posts
    .filter((post) => {
      if (selectedCourse !== "all" && post.course_id !== selectedCourse) return false;
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

  const handleCreateQuestion = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    await createPost.mutateAsync({
      title: newQuestionTitle,
      content: newQuestionContent,
      courseId: newQuestionCourse || undefined,
    });
    setNewQuestionTitle("");
    setNewQuestionContent("");
    setNewQuestionCourse("");
    setCreateDialogOpen(false);
  };

  const handleUpvote = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate("/auth");
      return;
    }
    await upvotePost.mutateAsync(postId);
  };

  const answeredCount = qaThreads.filter((t) => t.status === "answered").length;
  const unansweredCount = qaThreads.filter((t) => t.status !== "answered").length;
  const totalUpvotes = qaThreads.reduce((acc, t) => acc + (t.upvotes || 0), 0);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (selectedQuestion) {
    return (
      <DashboardLayout>
        <QuestionDetail
          question={selectedQuestion}
          onBack={() => setSelectedQuestion(null)}
          user={user}
          formatTimeAgo={formatTimeAgo}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Q&A</h1>
          <p className="text-muted-foreground">Ask questions and get answers from the community</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => !user && navigate("/auth")}>
              <Plus className="w-4 h-4 mr-2" /> Ask Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Ask a Question</DialogTitle>
              <DialogDescription>Get help from instructors and fellow learners</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Question Title</Label>
                <Input
                  placeholder="What do you need help with?"
                  value={newQuestionTitle}
                  onChange={(e) => setNewQuestionTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Related Course (optional)</Label>
                <Select value={newQuestionCourse} onValueChange={setNewQuestionCourse}>
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
                <Label>Question Details</Label>
                <Textarea
                  placeholder="Provide more context about your question. Include code snippets if relevant..."
                  rows={6}
                  value={newQuestionContent}
                  onChange={(e) => setNewQuestionContent(e.target.value)}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleCreateQuestion}
                disabled={!newQuestionTitle || !newQuestionContent || createPost.isPending}
              >
                {createPost.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Submit Question
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{qaThreads.length}</p>
                <p className="text-xs text-muted-foreground">Total Questions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{answeredCount}</p>
                <p className="text-xs text-muted-foreground">Answered</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{unansweredCount}</p>
                <p className="text-xs text-muted-foreground">Awaiting Answer</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ThumbsUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalUpvotes}</p>
                <p className="text-xs text-muted-foreground">Total Upvotes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-full sm:w-48">
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
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="upvoted">Most Upvoted</SelectItem>
            <SelectItem value="unanswered">Unanswered First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Questions List */}
      {qaThreads.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No questions found.</p>
          <p className="text-sm text-muted-foreground mt-2">Be the first to ask a question!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {qaThreads.map((question) => (
            <Card
              key={question.id}
              className="hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => setSelectedQuestion(question)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Vote Column */}
                  <div className="flex flex-col items-center gap-1 text-center min-w-[60px]">
                    <div
                      className={cn(
                        "text-lg font-bold",
                        (question.upvotes || 0) > 0 ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {question.upvotes || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">votes</div>
                    <div
                      className={cn(
                        "mt-2 px-2 py-1 rounded text-xs font-medium",
                        question.status === "answered"
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-muted-foreground"
                      )}
                    >
                      {question.replies_count || 0} {(question.replies_count || 0) === 1 ? "answer" : "answers"}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                        {question.title}
                      </h3>
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 my-2">
                      {question.content}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {question.course && (
                        <Badge variant="outline" className="text-xs">
                          {question.course.title}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        asked by {question.author?.name || "Anonymous"} • {formatTimeAgo(question.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

function QuestionDetail({
  question,
  onBack,
  user,
  formatTimeAgo,
}: {
  question: ForumPost;
  onBack: () => void;
  user: any;
  formatTimeAgo: (timestamp: string) => string;
}) {
  const navigate = useNavigate();
  const { data: replies = [], isLoading } = useForumReplies(question.id);
  const createReply = useCreateForumReply();
  const markAsAnswer = useMarkAsAnswer();
  const upvotePost = useUpvotePost();

  const [answerContent, setAnswerContent] = useState("");

  const handleSubmitAnswer = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    await createReply.mutateAsync({ postId: question.id, content: answerContent });
    setAnswerContent("");
  };

  const handleMarkAsAnswer = async (replyId: string) => {
    await markAsAnswer.mutateAsync({ replyId, postId: question.id });
  };

  return (
    <div className="max-w-4xl">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        ← Back to Q&A
      </Button>

      {/* Question */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Vote Buttons */}
            <div className="flex flex-col items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-primary"
                onClick={() => upvotePost.mutateAsync(question.id)}
              >
                <ThumbsUp className="w-5 h-5" />
              </Button>
              <span className="text-xl font-bold text-foreground">{question.upvotes || 0}</span>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                <ThumbsDown className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-3">{question.title}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={question.author?.avatar_url || undefined} />
                  <AvatarFallback>{question.author?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <span>{question.author?.name || "Anonymous"}</span>
                <span>•</span>
                <span>{formatTimeAgo(question.created_at)}</span>
                {question.course && (
                  <Badge variant="outline">{question.course.title}</Badge>
                )}
                {question.status === "answered" && (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="w-3 h-3" /> Answered
                  </Badge>
                )}
              </div>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{question.content}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answers */}
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        {replies.length} {replies.length === 1 ? "Answer" : "Answers"}
      </h3>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : replies.length === 0 ? (
        <Card className="mb-6">
          <CardContent className="py-8 text-center text-muted-foreground">
            No answers yet. Be the first to help!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 mb-6">
          {replies.map((answer) => (
            <Card
              key={answer.id}
              className={cn(answer.is_answer && "border-green-500 bg-green-500/5")}
            >
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Vote Buttons */}
                  <div className="flex flex-col items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <span className="font-bold text-foreground">{answer.upvotes || 0}</span>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                      <ThumbsDown className="w-4 h-4" />
                    </Button>
                    {answer.is_answer && (
                      <CheckCircle className="w-8 h-8 text-green-600 mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={answer.author?.avatar_url || undefined} />
                        <AvatarFallback>{answer.author?.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">{answer.author?.name || "Anonymous"}</span>
                      <span className="text-sm text-muted-foreground">
                        answered {formatTimeAgo(answer.created_at)}
                      </span>
                      {answer.is_answer && (
                        <Badge variant="default" className="bg-green-600">Accepted Answer</Badge>
                      )}
                    </div>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{answer.content}</p>
                    
                    {user && user.id === question.author_id && !answer.is_answer && question.status !== "answered" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => handleMarkAsAnswer(answer.id)}
                        disabled={markAsAnswer.isPending}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Accept Answer
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Answer Form */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold text-foreground mb-3">Your Answer</h4>
          <Textarea
            placeholder={user ? "Write your answer here..." : "Sign in to answer"}
            rows={6}
            value={answerContent}
            onChange={(e) => setAnswerContent(e.target.value)}
            className="mb-4"
            disabled={!user}
          />
          <Button 
            onClick={handleSubmitAnswer}
            disabled={!answerContent.trim() || createReply.isPending || !user}
          >
            {createReply.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Post Your Answer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default QA;
