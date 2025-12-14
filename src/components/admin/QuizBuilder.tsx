import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Edit,
  HelpCircle,
  Clock,
  Target,
  Loader2,
  CheckCircle,
  X,
} from "lucide-react";

interface QuizBuilderProps {
  courseId: string;
}

interface Quiz {
  id: string;
  course_id: string | null;
  title: string;
  description: string | null;
  time_limit: number;
  passing_score: number;
  total_questions: number;
}

interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  type: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string | null;
  order_index: number;
}

export function QuizBuilder({ courseId }: QuizBuilderProps) {
  const queryClient = useQueryClient();

  const [isAddQuizOpen, setIsAddQuizOpen] = useState(false);
  const [isEditQuizOpen, setIsEditQuizOpen] = useState(false);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [isEditQuestionOpen, setIsEditQuestionOpen] = useState(false);

  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<QuizQuestion | null>(null);

  const [quizForm, setQuizForm] = useState({
    title: "",
    description: "",
    time_limit: "30",
    passing_score: "70",
  });

  const [questionForm, setQuestionForm] = useState({
    question: "",
    type: "multiple-choice",
    options: ["", "", "", ""],
    correct_answer: "",
    explanation: "",
  });

  // Fetch quizzes for this course
  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ["course-quizzes", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Quiz[];
    },
  });

  // Fetch questions for selected quiz
  const { data: questions = [] } = useQuery({
    queryKey: ["quiz-questions", selectedQuiz?.id],
    queryFn: async () => {
      if (!selectedQuiz) return [];
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", selectedQuiz.id)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data as QuizQuestion[];
    },
    enabled: !!selectedQuiz,
  });

  // Mutations
  const createQuiz = useMutation({
    mutationFn: async (data: typeof quizForm) => {
      const { data: quiz, error } = await supabase
        .from("quizzes")
        .insert({
          course_id: courseId,
          title: data.title,
          description: data.description || null,
          time_limit: parseInt(data.time_limit),
          passing_score: parseInt(data.passing_score),
          total_questions: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return quiz;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-quizzes", courseId] });
      toast.success("Quiz created!");
      setIsAddQuizOpen(false);
      resetQuizForm();
    },
    onError: (error) => toast.error("Failed to create quiz: " + error.message),
  });

  const updateQuiz = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & typeof quizForm) => {
      const { error } = await supabase
        .from("quizzes")
        .update({
          title: data.title,
          description: data.description || null,
          time_limit: parseInt(data.time_limit),
          passing_score: parseInt(data.passing_score),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-quizzes", courseId] });
      toast.success("Quiz updated!");
      setIsEditQuizOpen(false);
      setSelectedQuiz(null);
      resetQuizForm();
    },
    onError: (error) => toast.error("Failed to update quiz: " + error.message),
  });

  const deleteQuiz = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("quizzes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-quizzes", courseId] });
      toast.success("Quiz deleted!");
      setSelectedQuiz(null);
    },
    onError: (error) => toast.error("Failed to delete quiz: " + error.message),
  });

  const createQuestion = useMutation({
    mutationFn: async (data: typeof questionForm & { quiz_id: string }) => {
      const options = data.type === "true-false" 
        ? ["True", "False"] 
        : data.options.filter((o) => o.trim());

      const { data: question, error } = await supabase
        .from("quiz_questions")
        .insert({
          quiz_id: data.quiz_id,
          question: data.question,
          type: data.type,
          options: options.length > 0 ? options : null,
          correct_answer: data.correct_answer,
          explanation: data.explanation || null,
          order_index: questions.length,
        })
        .select()
        .single();

      if (error) throw error;

      // Update total_questions count
      await supabase
        .from("quizzes")
        .update({ total_questions: questions.length + 1 })
        .eq("id", data.quiz_id);

      return question;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-questions", selectedQuiz?.id] });
      queryClient.invalidateQueries({ queryKey: ["course-quizzes", courseId] });
      toast.success("Question added!");
      setIsAddQuestionOpen(false);
      resetQuestionForm();
    },
    onError: (error) => toast.error("Failed to add question: " + error.message),
  });

  const updateQuestion = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & typeof questionForm) => {
      const options = data.type === "true-false" 
        ? ["True", "False"] 
        : data.options.filter((o) => o.trim());

      const { error } = await supabase
        .from("quiz_questions")
        .update({
          question: data.question,
          type: data.type,
          options: options.length > 0 ? options : null,
          correct_answer: data.correct_answer,
          explanation: data.explanation || null,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-questions", selectedQuiz?.id] });
      toast.success("Question updated!");
      setIsEditQuestionOpen(false);
      setSelectedQuestion(null);
      resetQuestionForm();
    },
    onError: (error) => toast.error("Failed to update question: " + error.message),
  });

  const deleteQuestion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("quiz_questions").delete().eq("id", id);
      if (error) throw error;

      // Update total_questions count
      if (selectedQuiz) {
        await supabase
          .from("quizzes")
          .update({ total_questions: Math.max(0, questions.length - 1) })
          .eq("id", selectedQuiz.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-questions", selectedQuiz?.id] });
      queryClient.invalidateQueries({ queryKey: ["course-quizzes", courseId] });
      toast.success("Question deleted!");
    },
    onError: (error) => toast.error("Failed to delete question: " + error.message),
  });

  const resetQuizForm = () =>
    setQuizForm({ title: "", description: "", time_limit: "30", passing_score: "70" });

  const resetQuestionForm = () =>
    setQuestionForm({
      question: "",
      type: "multiple-choice",
      options: ["", "", "", ""],
      correct_answer: "",
      explanation: "",
    });

  const openEditQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setQuizForm({
      title: quiz.title,
      description: quiz.description || "",
      time_limit: quiz.time_limit.toString(),
      passing_score: quiz.passing_score.toString(),
    });
    setIsEditQuizOpen(true);
  };

  const openEditQuestion = (question: QuizQuestion) => {
    setSelectedQuestion(question);
    setQuestionForm({
      question: question.question,
      type: question.type,
      options: question.options || ["", "", "", ""],
      correct_answer: question.correct_answer,
      explanation: question.explanation || "",
    });
    setIsEditQuestionOpen(true);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Quiz Builder
          </h3>
          <p className="text-sm text-muted-foreground">
            {quizzes.length} quizzes in this course
          </p>
        </div>
        <Dialog open={isAddQuizOpen} onOpenChange={setIsAddQuizOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Quiz
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Quiz</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Quiz Title</Label>
                <Input
                  placeholder="e.g. Module 1 Assessment"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Quiz description..."
                  value={quizForm.description}
                  onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Time Limit (minutes)
                  </Label>
                  <Input
                    type="number"
                    value={quizForm.time_limit}
                    onChange={(e) => setQuizForm({ ...quizForm, time_limit: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Target className="w-3 h-3" /> Passing Score (%)
                  </Label>
                  <Input
                    type="number"
                    value={quizForm.passing_score}
                    onChange={(e) => setQuizForm({ ...quizForm, passing_score: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddQuizOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => createQuiz.mutate(quizForm)}
                  disabled={!quizForm.title || createQuiz.isPending}
                >
                  {createQuiz.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Quiz"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quizzes List */}
      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="font-medium mb-2">No quizzes yet</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Add quizzes to assess student learning
            </p>
            <Button onClick={() => setIsAddQuizOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Quiz
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-3">
          {quizzes.map((quiz) => (
            <AccordionItem
              key={quiz.id}
              value={quiz.id}
              className="border rounded-lg bg-card overflow-hidden"
            >
              <AccordionTrigger
                className="px-4 py-3 hover:no-underline hover:bg-muted/50"
                onClick={() => setSelectedQuiz(quiz)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  <span className="font-medium text-left">{quiz.title}</span>
                  <div className="flex items-center gap-2 ml-auto mr-4">
                    <Badge variant="secondary">
                      {quiz.total_questions} questions
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Clock className="w-3 h-3" />
                      {quiz.time_limit} min
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Target className="w-3 h-3" />
                      {quiz.passing_score}%
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {quiz.description && (
                  <p className="text-sm text-muted-foreground mb-4">{quiz.description}</p>
                )}

                {/* Questions */}
                <div className="space-y-2 mb-4">
                  {selectedQuiz?.id === quiz.id &&
                    questions.map((q, index) => (
                      <div
                        key={q.id}
                        className="flex items-start gap-3 p-3 rounded-md bg-muted/50 group"
                      >
                        <Badge variant="secondary" className="mt-0.5">
                          {index + 1}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{q.question}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {q.type}
                            </Badge>
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              {q.correct_answer}
                            </span>
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEditQuestion(q)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => deleteQuestion.mutate(q.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Quiz Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedQuiz(quiz);
                      resetQuestionForm();
                      setIsAddQuestionOpen(true);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Question
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEditQuiz(quiz)}>
                    <Edit className="w-3 h-3 mr-1" />
                    Edit Quiz
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm("Delete this quiz and all its questions?")) {
                        deleteQuiz.mutate(quiz.id);
                      }
                    }}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Edit Quiz Dialog */}
      <Dialog open={isEditQuizOpen} onOpenChange={setIsEditQuizOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Quiz</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Quiz Title</Label>
              <Input
                value={quizForm.title}
                onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={quizForm.description}
                onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Time Limit (minutes)</Label>
                <Input
                  type="number"
                  value={quizForm.time_limit}
                  onChange={(e) => setQuizForm({ ...quizForm, time_limit: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Passing Score (%)</Label>
                <Input
                  type="number"
                  value={quizForm.passing_score}
                  onChange={(e) => setQuizForm({ ...quizForm, passing_score: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditQuizOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => selectedQuiz && updateQuiz.mutate({ id: selectedQuiz.id, ...quizForm })}
                disabled={!quizForm.title || updateQuiz.isPending}
              >
                {updateQuiz.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Question Dialog */}
      <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Question</Label>
              <Textarea
                placeholder="Enter your question..."
                value={questionForm.question}
                onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select
                value={questionForm.type}
                onValueChange={(v) => setQuestionForm({ ...questionForm, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  <SelectItem value="true-false">True/False</SelectItem>
                  <SelectItem value="short-answer">Short Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {questionForm.type === "multiple-choice" && (
              <div className="space-y-2">
                <Label>Options</Label>
                {questionForm.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                    />
                    {index > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => {
                          const newOptions = questionForm.options.filter((_, i) => i !== index);
                          setQuestionForm({ ...questionForm, options: newOptions });
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {questionForm.options.length < 6 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setQuestionForm({ ...questionForm, options: [...questionForm.options, ""] })
                    }
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Option
                  </Button>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Correct Answer</Label>
              {questionForm.type === "true-false" ? (
                <Select
                  value={questionForm.correct_answer}
                  onValueChange={(v) => setQuestionForm({ ...questionForm, correct_answer: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select answer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="True">True</SelectItem>
                    <SelectItem value="False">False</SelectItem>
                  </SelectContent>
                </Select>
              ) : questionForm.type === "multiple-choice" ? (
                <Select
                  value={questionForm.correct_answer}
                  onValueChange={(v) => setQuestionForm({ ...questionForm, correct_answer: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select correct option" />
                  </SelectTrigger>
                  <SelectContent>
                    {questionForm.options
                      .filter((o) => o.trim())
                      .map((option, index) => (
                        <SelectItem key={index} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder="Correct answer..."
                  value={questionForm.correct_answer}
                  onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Explanation (optional)</Label>
              <Textarea
                placeholder="Explain why this is the correct answer..."
                value={questionForm.explanation}
                onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddQuestionOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() =>
                  selectedQuiz && createQuestion.mutate({ ...questionForm, quiz_id: selectedQuiz.id })
                }
                disabled={!questionForm.question || !questionForm.correct_answer || createQuestion.isPending}
              >
                {createQuestion.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Question"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog open={isEditQuestionOpen} onOpenChange={setIsEditQuestionOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Question</Label>
              <Textarea
                value={questionForm.question}
                onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select
                value={questionForm.type}
                onValueChange={(v) => setQuestionForm({ ...questionForm, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  <SelectItem value="true-false">True/False</SelectItem>
                  <SelectItem value="short-answer">Short Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {questionForm.type === "multiple-choice" && (
              <div className="space-y-2">
                <Label>Options</Label>
                {questionForm.options.map((option, index) => (
                  <Input
                    key={index}
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                  />
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label>Correct Answer</Label>
              {questionForm.type === "true-false" ? (
                <Select
                  value={questionForm.correct_answer}
                  onValueChange={(v) => setQuestionForm({ ...questionForm, correct_answer: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="True">True</SelectItem>
                    <SelectItem value="False">False</SelectItem>
                  </SelectContent>
                </Select>
              ) : questionForm.type === "multiple-choice" ? (
                <Select
                  value={questionForm.correct_answer}
                  onValueChange={(v) => setQuestionForm({ ...questionForm, correct_answer: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {questionForm.options
                      .filter((o) => o.trim())
                      .map((option, index) => (
                        <SelectItem key={index} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={questionForm.correct_answer}
                  onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Explanation</Label>
              <Textarea
                value={questionForm.explanation}
                onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditQuestionOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() =>
                  selectedQuestion && updateQuestion.mutate({ id: selectedQuestion.id, ...questionForm })
                }
                disabled={!questionForm.question || !questionForm.correct_answer || updateQuestion.isPending}
              >
                {updateQuestion.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
