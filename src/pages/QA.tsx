import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { mockForumThreads, forumCourses, ForumThread } from "@/data/forum";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

type SortOption = "recent" | "upvoted" | "unanswered";

const QA = () => {
  const [selectedCourse, setSelectedCourse] = useState("All Courses");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<ForumThread | null>(null);
  const [newQuestionTitle, setNewQuestionTitle] = useState("");
  const [newQuestionContent, setNewQuestionContent] = useState("");
  const [answerContent, setAnswerContent] = useState("");

  // Filter to only show unanswered or recently answered questions (Q&A style)
  const qaThreads = mockForumThreads
    .filter((thread) => {
      if (selectedCourse !== "All Courses" && thread.courseTitle !== selectedCourse) return false;
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

  const answeredCount = qaThreads.filter((t) => t.isAnswered).length;
  const unansweredCount = qaThreads.filter((t) => !t.isAnswered).length;

  if (selectedQuestion) {
    return (
      <DashboardLayout>
        <QuestionDetail
          question={selectedQuestion}
          onBack={() => setSelectedQuestion(null)}
          answerContent={answerContent}
          setAnswerContent={setAnswerContent}
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
        <Dialog>
          <DialogTrigger asChild>
            <Button>
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
                <Label>Related Course</Label>
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
                <Label>Question Details</Label>
                <Textarea
                  placeholder="Provide more context about your question. Include code snippets if relevant..."
                  rows={6}
                  value={newQuestionContent}
                  onChange={(e) => setNewQuestionContent(e.target.value)}
                />
              </div>
              <Button className="w-full">Submit Question</Button>
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
                <p className="text-2xl font-bold text-foreground">
                  {qaThreads.reduce((acc, t) => acc + t.upvotes, 0)}
                </p>
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
                      question.upvotes > 0 ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {question.upvotes}
                  </div>
                  <div className="text-xs text-muted-foreground">votes</div>
                  <div
                    className={cn(
                      "mt-2 px-2 py-1 rounded text-xs font-medium",
                      question.isAnswered
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-muted-foreground"
                    )}
                  >
                    {question.replyCount} {question.replyCount === 1 ? "answer" : "answers"}
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
                    <Badge variant="outline" className="text-xs">
                      {question.courseTitle}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {question.topic}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-auto">
                      asked by {question.authorName} • {formatTimeAgo(question.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {qaThreads.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No questions found.</p>
        </div>
      )}
    </DashboardLayout>
  );
};

function QuestionDetail({
  question,
  onBack,
  answerContent,
  setAnswerContent,
}: {
  question: ForumThread;
  onBack: () => void;
  answerContent: string;
  setAnswerContent: (v: string) => void;
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
        ← Back to Q&A
      </Button>

      {/* Question */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Vote Buttons */}
            <div className="flex flex-col items-center gap-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <ThumbsUp className="w-5 h-5" />
              </Button>
              <span className="text-xl font-bold text-foreground">{question.upvotes}</span>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                <ThumbsDown className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-3">{question.title}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={question.authorAvatar} />
                  <AvatarFallback>{question.authorName[0]}</AvatarFallback>
                </Avatar>
                <span>{question.authorName}</span>
                <span>•</span>
                <span>{formatTimeAgo(question.timestamp)}</span>
                <Badge variant="outline">{question.courseTitle}</Badge>
              </div>
              <p className="text-foreground leading-relaxed">{question.content}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answers */}
      <h3 className="font-semibold text-foreground mb-4">
        {question.replies.length} {question.replies.length === 1 ? "Answer" : "Answers"}
      </h3>
      <div className="space-y-4 mb-6">
        {question.replies.map((answer) => (
          <Card
            key={answer.id}
            className={cn(answer.isMarkedAnswer && "border-primary bg-primary/5")}
          >
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Vote Buttons */}
                <div className="flex flex-col items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                    <ThumbsUp className="w-4 h-4" />
                  </Button>
                  <span className="font-bold text-foreground">{answer.upvotes}</span>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                    <ThumbsDown className="w-4 h-4" />
                  </Button>
                  {answer.isMarkedAnswer && (
                    <CheckCircle className="w-8 h-8 text-primary mt-2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={answer.authorAvatar} />
                      <AvatarFallback>{answer.authorName[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">{answer.authorName}</span>
                    <span className="text-sm text-muted-foreground">
                      answered {formatTimeAgo(answer.timestamp)}
                    </span>
                    {answer.isMarkedAnswer && (
                      <Badge variant="default">Accepted Answer</Badge>
                    )}
                  </div>
                  <p className="text-foreground leading-relaxed">{answer.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Answer Form */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold text-foreground mb-3">Your Answer</h4>
          <Textarea
            placeholder="Write your answer here. You can include code snippets using markdown..."
            rows={6}
            value={answerContent}
            onChange={(e) => setAnswerContent(e.target.value)}
            className="mb-4"
          />
          <Button>Post Your Answer</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default QA;
