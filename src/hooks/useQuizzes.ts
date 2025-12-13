import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Quiz {
  id: string;
  course_id: string | null;
  title: string;
  description: string | null;
  time_limit: number;
  passing_score: number;
  total_questions: number;
  created_at: string;
  course?: {
    title: string;
  };
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  type: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string | null;
  code_snippet: string | null;
  order_index: number;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  answers: Record<string, any> | null;
  completed_at: string;
}

export function useQuizzes() {
  return useQuery({
    queryKey: ["quizzes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select(`
          *,
          course:courses(title)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Quiz[];
    },
  });
}

export function useQuizQuestions(quizId: string | null) {
  return useQuery({
    queryKey: ["quiz-questions", quizId],
    queryFn: async () => {
      if (!quizId) return [];

      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data as QuizQuestion[];
    },
    enabled: !!quizId,
  });
}

export function useQuizAttempts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["quiz-attempts", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });

      if (error) throw error;
      return data as QuizAttempt[];
    },
    enabled: !!user,
  });
}

export function useSubmitQuiz() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quizId, score, answers }: { quizId: string; score: number; answers: Record<string, any> }) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("quiz_attempts")
        .insert({
          user_id: user.id,
          quiz_id: quizId,
          score,
          answers,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts"] });
      toast.success("Quiz submitted!");
    },
    onError: (error) => {
      toast.error("Failed to submit quiz: " + error.message);
    },
  });
}
