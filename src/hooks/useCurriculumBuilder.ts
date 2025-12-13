import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
  lessons?: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  module_id: string;
  title: string;
  type: string;
  duration: string | null;
  video_url: string | null;
  content: string | null;
  order_index: number;
  created_at: string;
}

export function useCurriculumBuilder(courseId: string | null) {
  const queryClient = useQueryClient();

  const { data: modules = [], isLoading } = useQuery({
    queryKey: ["course-modules", courseId],
    queryFn: async () => {
      if (!courseId) return [];
      
      const { data: modulesData, error: modulesError } = await supabase
        .from("course_modules")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });

      if (modulesError) throw modulesError;

      // Fetch lessons for all modules
      const moduleIds = modulesData.map((m) => m.id);
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("course_lessons")
        .select("*")
        .in("module_id", moduleIds)
        .order("order_index", { ascending: true });

      if (lessonsError) throw lessonsError;

      // Group lessons by module
      return modulesData.map((module) => ({
        ...module,
        lessons: lessonsData.filter((l) => l.module_id === module.id),
      })) as CourseModule[];
    },
    enabled: !!courseId,
  });

  const createModule = useMutation({
    mutationFn: async (data: { course_id: string; title: string; description?: string }) => {
      const maxOrderIndex = modules.length > 0 ? Math.max(...modules.map((m) => m.order_index)) : -1;
      
      const { data: newModule, error } = await supabase
        .from("course_modules")
        .insert({
          ...data,
          order_index: maxOrderIndex + 1,
        })
        .select()
        .single();

      if (error) throw error;
      return newModule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] });
      toast.success("Module added");
    },
    onError: (error) => {
      toast.error("Failed to add module: " + error.message);
    },
  });

  const updateModule = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CourseModule> & { id: string }) => {
      const { error } = await supabase
        .from("course_modules")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] });
      toast.success("Module updated");
    },
    onError: (error) => {
      toast.error("Failed to update module: " + error.message);
    },
  });

  const deleteModule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("course_modules")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] });
      toast.success("Module deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete module: " + error.message);
    },
  });

  const createLesson = useMutation({
    mutationFn: async (data: { module_id: string; title: string; type?: string; video_url?: string; content?: string; duration?: string }) => {
      const parentModule = modules.find((m) => m.id === data.module_id);
      const existingLessons = parentModule?.lessons || [];
      const maxOrderIndex = existingLessons.length > 0 ? Math.max(...existingLessons.map((l) => l.order_index)) : -1;

      const { data: newLesson, error } = await supabase
        .from("course_lessons")
        .insert({
          ...data,
          type: data.type || "video",
          order_index: maxOrderIndex + 1,
        })
        .select()
        .single();

      if (error) throw error;
      return newLesson;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] });
      toast.success("Lesson added");
    },
    onError: (error) => {
      toast.error("Failed to add lesson: " + error.message);
    },
  });

  const updateLesson = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CourseLesson> & { id: string }) => {
      const { error } = await supabase
        .from("course_lessons")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] });
      toast.success("Lesson updated");
    },
    onError: (error) => {
      toast.error("Failed to update lesson: " + error.message);
    },
  });

  const deleteLesson = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("course_lessons")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] });
      toast.success("Lesson deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete lesson: " + error.message);
    },
  });

  return {
    modules,
    isLoading,
    createModule,
    updateModule,
    deleteModule,
    createLesson,
    updateLesson,
    deleteLesson,
  };
}
