import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useQuizzes, useQuizQuestions, useQuizAttempts, useSubmitQuiz, QuizQuestion } from "@/hooks/useQuizzes";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight, 
  RotateCcw, Trophy, AlertCircle, Code, Loader2, BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "list" | "active" | "results";

const QuizAssessment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: quizzes = [], isLoading } = useQuizzes();
  const { data: attempts = [] } = useQuizAttempts();
  const submitQuiz = useSubmitQuiz();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean } | null>(null);

  const { data: questions = [] } = useQuizQuestions(activeQuizId);
  const activeQuiz = quizzes.find(q => q.id === activeQuizId);

  // Get last attempt for each quiz
  const getQuizStatus = (quizId: string) => {
    const quizAttempts = attempts.filter(a => a.quiz_id === quizId);
    if (quizAttempts.length === 0) return { status: "not-started" as const, score: undefined };
    const lastAttempt = quizAttempts[0];
    return { status: "completed" as const, score: lastAttempt.score };
  };

  const startQuiz = (quizId: string) => {
    setActiveQuizId(quizId);
    setViewMode("active");
    setCurrentQuestionIndex(0);
    setAnswers({});
    setQuizResult(null);
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz || !user) return;

    // Calculate score
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= activeQuiz.passing_score;

    // Save attempt
    await submitQuiz.mutateAsync({
      quizId: activeQuiz.id,
      score,
      answers,
    });

    setQuizResult({ score, passed });
    setViewMode("results");
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Sign in to take quizzes</h2>
          <p className="text-muted-foreground mb-6">Test your knowledge with assessments</p>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
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

  if (viewMode === "active" && activeQuiz && questions.length > 0) {
    const question = questions[currentQuestionIndex];
    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / questions.length) * 100;

    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{activeQuiz.title}</h1>
              <p className="text-sm text-muted-foreground">{activeQuiz.course?.title || "General"}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-lg font-mono bg-card border border-border rounded-lg px-4 py-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>{activeQuiz.time_limit} min</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{answeredCount} answered</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Navigation Grid */}
          <div className="flex flex-wrap gap-2 mb-6">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={cn(
                  "w-10 h-10 rounded-lg text-sm font-medium transition-colors",
                  idx === currentQuestionIndex
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
              {question.code_snippet && (
                <div className="mt-4 p-4 bg-muted rounded-lg font-mono text-sm">
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <Code className="w-4 h-4" /> Code
                  </div>
                  <pre className="whitespace-pre-wrap">{question.code_snippet}</pre>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {question.type === "short-answer" ? (
                <Input
                  placeholder="Type your answer..."
                  value={answers[question.id] || ""}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  className="max-w-md"
                />
              ) : (
                <RadioGroup
                  value={answers[question.id]}
                  onValueChange={(value) => handleAnswer(question.id, value)}
                  className="space-y-3"
                >
                  {(question.options as string[] || []).map((option, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer",
                        answers[question.id] === idx.toString()
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
            <Button variant="outline" onClick={() => setCurrentQuestionIndex(i => Math.max(i - 1, 0))} disabled={currentQuestionIndex === 0}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            {currentQuestionIndex === questions.length - 1 ? (
              <Button onClick={handleSubmitQuiz} disabled={submitQuiz.isPending}>
                {submitQuiz.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={() => setCurrentQuestionIndex(i => Math.min(i + 1, questions.length - 1))}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (viewMode === "results" && activeQuiz && quizResult) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          {/* Results Header */}
          <Card className={cn("mb-6", quizResult.passed ? "border-primary" : "border-destructive")}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div
                  className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4",
                    quizResult.passed ? "bg-primary/10" : "bg-destructive/10"
                  )}
                >
                  {quizResult.passed ? (
                    <Trophy className="w-10 h-10 text-primary" />
                  ) : (
                    <AlertCircle className="w-10 h-10 text-destructive" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {quizResult.passed ? "Congratulations!" : "Keep Practicing"}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {quizResult.passed
                    ? "You've passed the assessment!"
                    : `You need ${activeQuiz.passing_score}% to pass. Try again!`}
                </p>
                <div className="text-5xl font-bold text-foreground mb-2">{quizResult.score}%</div>
                <p className="text-sm text-muted-foreground">
                  {Object.keys(answers).length} of {questions.length} questions answered
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Review Answers */}
          <h3 className="text-lg font-semibold mb-4">Review Answers</h3>
          <div className="space-y-4 mb-6">
            {questions.map((question, idx) => {
              const userAnswer = answers[question.id];
              const isCorrect = userAnswer === question.correct_answer;

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
                            {(question.options as string[]).map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                className={cn(
                                  "p-2 rounded",
                                  optIdx.toString() === question.correct_answer
                                    ? "bg-primary/10 text-primary"
                                    : userAnswer === optIdx.toString() && !isCorrect
                                    ? "bg-destructive/10 text-destructive"
                                    : "text-muted-foreground"
                                )}
                              >
                                {opt}
                                {optIdx.toString() === question.correct_answer && " ✓"}
                                {userAnswer === optIdx.toString() && !isCorrect && " ✗"}
                              </div>
                            ))}
                          </div>
                        )}
                        {question.explanation && (
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setViewMode("list"); setActiveQuizId(null); }}>
              Back to Quizzes
            </Button>
            <Button onClick={() => startQuiz(activeQuiz.id)}>
              <RotateCcw className="w-4 h-4 mr-2" /> Retake Quiz
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Quiz List View
  const completedCount = quizzes.filter(q => getQuizStatus(q.id).status === "completed").length;
  const avgScore = attempts.length > 0 
    ? Math.round(attempts.reduce((acc, a) => acc + a.score, 0) / attempts.length)
    : 0;

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
                <p className="text-2xl font-bold text-foreground">{completedCount}</p>
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
                <p className="text-2xl font-bold text-foreground">{quizzes.length - completedCount}</p>
                <p className="text-sm text-muted-foreground">Available</p>
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
                <p className="text-2xl font-bold text-foreground">{avgScore}%</p>
                <p className="text-sm text-muted-foreground">Avg. Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz List */}
      {quizzes.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">No quizzes available yet.</p>
          <p className="text-sm text-muted-foreground">Check back later or ask your instructor to add quizzes.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz) => {
            const { status, score } = getQuizStatus(quiz.id);

            return (
              <Card key={quiz.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{quiz.title}</h3>
                        <Badge
                          variant={status === "completed" ? "default" : "outline"}
                        >
                          {status === "completed" ? "Completed" : "Not Started"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{quiz.course?.title || "General"}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" /> {quiz.time_limit} min
                        </span>
                        <span>{quiz.total_questions} questions</span>
                        <span>Pass: {quiz.passing_score}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {score !== undefined && (
                        <div className="text-right">
                          <span
                            className={cn(
                              "text-2xl font-bold",
                              score >= quiz.passing_score ? "text-primary" : "text-destructive"
                            )}
                          >
                            {score}%
                          </span>
                        </div>
                      )}
                      <Button
                        onClick={() => startQuiz(quiz.id)}
                        variant={status === "completed" ? "outline" : "default"}
                      >
                        {status === "completed" ? "Retake" : "Start Quiz"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default QuizAssessment;
