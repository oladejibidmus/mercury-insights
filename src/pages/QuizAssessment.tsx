import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { mockQuizzes, currentQuiz, Quiz, QuizQuestion } from "@/data/quizzes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight, 
  RotateCcw, Trophy, AlertCircle, Code
} from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "list" | "active" | "results";

const QuizAssessment = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setViewMode("active");
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setTimeRemaining(quiz.timeLimit * 60);
  };

  const handleAnswer = (questionId: string, answer: string | number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const submitQuiz = () => {
    setShowResults(true);
    setViewMode("results");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (viewMode === "active" && activeQuiz) {
    return (
      <DashboardLayout>
        <QuizPlayer
          quiz={activeQuiz}
          currentIndex={currentQuestionIndex}
          answers={answers}
          onAnswer={handleAnswer}
          onNext={() => setCurrentQuestionIndex((i) => Math.min(i + 1, activeQuiz.questions.length - 1))}
          onPrev={() => setCurrentQuestionIndex((i) => Math.max(i - 1, 0))}
          onJump={setCurrentQuestionIndex}
          onSubmit={submitQuiz}
          timeRemaining={timeRemaining}
        />
      </DashboardLayout>
    );
  }

  if (viewMode === "results" && activeQuiz) {
    const score = calculateScore(activeQuiz.questions, answers);
    const passed = score >= activeQuiz.passingScore;

    return (
      <DashboardLayout>
        <QuizResults
          quiz={activeQuiz}
          answers={answers}
          score={score}
          passed={passed}
          onRetake={() => startQuiz(activeQuiz)}
          onBack={() => setViewMode("list")}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Quiz & Assessment</h1>
        <p className="text-muted-foreground">Test your knowledge with quizzes and assessments</p>
      </div>

      {/* Quiz Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {mockQuizzes.filter((q) => q.status === "completed").length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {mockQuizzes.filter((q) => q.status === "in-progress").length}
                </p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(
                    mockQuizzes
                      .filter((q) => q.score !== undefined)
                      .reduce((acc, q) => acc + (q.score || 0), 0) /
                      Math.max(mockQuizzes.filter((q) => q.score !== undefined).length, 1)
                  )}%
                </p>
                <p className="text-sm text-muted-foreground">Avg. Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz List */}
      <div className="space-y-4">
        {mockQuizzes.map((quiz) => (
          <Card key={quiz.id} className="hover:border-primary/50 transition-colors">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{quiz.title}</h3>
                    <Badge
                      variant={
                        quiz.status === "completed"
                          ? "default"
                          : quiz.status === "in-progress"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {quiz.status === "completed"
                        ? "Completed"
                        : quiz.status === "in-progress"
                        ? "In Progress"
                        : "Not Started"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{quiz.courseTitle}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {quiz.timeLimit} min
                    </span>
                    <span>{quiz.totalQuestions} questions</span>
                    <span>Pass: {quiz.passingScore}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {quiz.score !== undefined && (
                    <div className="text-right">
                      <span
                        className={cn(
                          "text-2xl font-bold",
                          quiz.score >= quiz.passingScore ? "text-primary" : "text-destructive"
                        )}
                      >
                        {quiz.score}%
                      </span>
                    </div>
                  )}
                  <Button
                    onClick={() => startQuiz(quiz)}
                    variant={quiz.status === "completed" ? "outline" : "default"}
                  >
                    {quiz.status === "completed"
                      ? "Retake"
                      : quiz.status === "in-progress"
                      ? "Continue"
                      : "Start Quiz"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

function QuizPlayer({
  quiz,
  currentIndex,
  answers,
  onAnswer,
  onNext,
  onPrev,
  onJump,
  onSubmit,
  timeRemaining,
}: {
  quiz: Quiz;
  currentIndex: number;
  answers: Record<string, string | number>;
  onAnswer: (questionId: string, answer: string | number) => void;
  onNext: () => void;
  onPrev: () => void;
  onJump: (index: number) => void;
  onSubmit: () => void;
  timeRemaining: number;
}) {
  const question = quiz.questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / quiz.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{quiz.title}</h1>
          <p className="text-sm text-muted-foreground">{quiz.courseTitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-lg font-mono bg-card border border-border rounded-lg px-4 py-2">
            <Clock className="w-5 h-5 text-primary" />
            <span>{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Question {currentIndex + 1} of {quiz.questions.length}</span>
          <span>{answeredCount} answered</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Navigation Grid */}
      <div className="flex flex-wrap gap-2 mb-6">
        {quiz.questions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => onJump(idx)}
            className={cn(
              "w-10 h-10 rounded-lg text-sm font-medium transition-colors",
              idx === currentIndex
                ? "bg-primary text-primary-foreground"
                : answers[q.id] !== undefined
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{question.type.replace("-", " ")}</Badge>
          </div>
          <CardTitle className="text-xl">{question.question}</CardTitle>
          {question.codeSnippet && (
            <div className="mt-4 p-4 bg-muted rounded-lg font-mono text-sm">
              <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                <Code className="w-4 h-4" /> Code
              </div>
              <pre className="whitespace-pre-wrap">{question.codeSnippet}</pre>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {question.type === "short-answer" ? (
            <Input
              placeholder="Type your answer..."
              value={(answers[question.id] as string) || ""}
              onChange={(e) => onAnswer(question.id, e.target.value)}
              className="max-w-md"
            />
          ) : (
            <RadioGroup
              value={answers[question.id]?.toString()}
              onValueChange={(value) => onAnswer(question.id, parseInt(value))}
              className="space-y-3"
            >
              {question.options?.map((option, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer",
                    answers[question.id] === idx
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                  <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onPrev} disabled={currentIndex === 0}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </Button>
        {currentIndex === quiz.questions.length - 1 ? (
          <Button onClick={onSubmit}>Submit Quiz</Button>
        ) : (
          <Button onClick={onNext}>
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}

function QuizResults({
  quiz,
  answers,
  score,
  passed,
  onRetake,
  onBack,
}: {
  quiz: Quiz;
  answers: Record<string, string | number>;
  score: number;
  passed: boolean;
  onRetake: () => void;
  onBack: () => void;
}) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Results Header */}
      <Card className={cn("mb-6", passed ? "border-primary" : "border-destructive")}>
        <CardContent className="pt-6">
          <div className="text-center">
            <div
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4",
                passed ? "bg-primary/10" : "bg-destructive/10"
              )}
            >
              {passed ? (
                <Trophy className="w-10 h-10 text-primary" />
              ) : (
                <AlertCircle className="w-10 h-10 text-destructive" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {passed ? "Congratulations!" : "Keep Practicing"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {passed
                ? "You've passed the assessment!"
                : `You need ${quiz.passingScore}% to pass. Try again!`}
            </p>
            <div className="text-5xl font-bold text-foreground mb-2">{score}%</div>
            <p className="text-sm text-muted-foreground">
              {Object.keys(answers).length} of {quiz.questions.length} questions answered
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Review Answers */}
      <h3 className="text-lg font-semibold mb-4">Review Answers</h3>
      <div className="space-y-4 mb-6">
        {quiz.questions.map((question, idx) => {
          const userAnswer = answers[question.id];
          const isCorrect = userAnswer === question.correctAnswer;

          return (
            <Card key={question.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      isCorrect ? "bg-primary/10" : "bg-destructive/10"
                    )}
                  >
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground mb-2">
                      {idx + 1}. {question.question}
                    </p>
                    {question.options && (
                      <div className="space-y-1 text-sm mb-3">
                        {question.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={cn(
                              "p-2 rounded",
                              optIdx === question.correctAnswer
                                ? "bg-primary/10 text-primary"
                                : userAnswer === optIdx && !isCorrect
                                ? "bg-destructive/10 text-destructive"
                                : "text-muted-foreground"
                            )}
                          >
                            {opt}
                            {optIdx === question.correctAnswer && " ✓"}
                            {userAnswer === optIdx && !isCorrect && " ✗"}
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                      <strong>Explanation:</strong> {question.explanation}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>
          Back to Quizzes
        </Button>
        <Button onClick={onRetake}>
          <RotateCcw className="w-4 h-4 mr-2" /> Retake Quiz
        </Button>
      </div>
    </div>
  );
}

function calculateScore(questions: QuizQuestion[], answers: Record<string, string | number>) {
  let correct = 0;
  questions.forEach((q) => {
    if (answers[q.id] === q.correctAnswer) correct++;
  });
  return Math.round((correct / questions.length) * 100);
}

export default QuizAssessment;
