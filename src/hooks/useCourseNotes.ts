import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface CourseNote {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  content: string | null;
  is_bookmarked: boolean;
  created_at: string;
  updated_at: string;
}

export function useCourseNotes(courseId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["course-notes", courseId, user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("course_notes")
        .select("*")
        .eq("course_id", courseId)
        .eq("user_id", user.id);

      if (error) throw error;
      return data as CourseNote[];
    },
    enabled: !!user && !!courseId,
  });
}

export function useLessonNote(courseId: string, lessonId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["lesson-note", lessonId, user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("course_notes")
        .select("*")
        .eq("lesson_id", lessonId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as CourseNote | null;
    },
    enabled: !!user && !!lessonId,
  });
}

export function useUpsertNote() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      courseId,
      lessonId,
      content,
      isBookmarked,
    }: {
      courseId: string;
      lessonId: string;
      content?: string;
      isBookmarked?: boolean;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // First check if a note exists
      const { data: existing } = await supabase
        .from("course_notes")
        .select("id, content, is_bookmarked")
        .eq("lesson_id", lessonId)
        .eq("user_id", user.id)
        .maybeSingle();

      const noteData = {
        user_id: user.id,
        course_id: courseId,
        lesson_id: lessonId,
        content: content !== undefined ? content : (existing?.content || null),
        is_bookmarked: isBookmarked !== undefined ? isBookmarked : (existing?.is_bookmarked || false),
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        const { error } = await supabase
          .from("course_notes")
          .update(noteData)
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("course_notes")
          .insert(noteData);

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["course-notes", variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ["lesson-note", variables.lessonId] });
    },
    onError: () => {
      toast.error("Failed to save note");
    },
  });
}

export function useBookmarkedLessons(courseId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["bookmarked-lessons", courseId, user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("course_notes")
        .select("lesson_id")
        .eq("course_id", courseId)
        .eq("user_id", user.id)
        .eq("is_bookmarked", true);

      if (error) throw error;
      return data.map((n) => n.lesson_id);
    },
    enabled: !!user && !!courseId,
  });
}
