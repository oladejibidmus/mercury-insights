import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Course {
  id: string;
  title: string;
  description: string | null;
  instructor: string;
  category: string;
  level: string;
  status: string;
  thumbnail: string | null;
  duration: string | null;
  rating: number | null;
  enrollment_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
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
}

export function useAdminCourses() {
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Course[];
    },
  });

  const createCourse = useMutation({
    mutationFn: async (course: Omit<Course, "id" | "created_at" | "updated_at" | "rating" | "enrollment_count">) => {
      const { data, error } = await supabase
        .from("courses")
        .insert(course)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast.success("Course created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create course: " + error.message);
    },
  });

  const updateCourse = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Course> & { id: string }) => {
      const { error } = await supabase
        .from("courses")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast.success("Course updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update course: " + error.message);
    },
  });

  const deleteCourse = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast.success("Course deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete course: " + error.message);
    },
  });

  const duplicateCourse = useMutation({
    mutationFn: async (course: Course) => {
      const { id, created_at, updated_at, ...courseData } = course;
      const { data, error } = await supabase
        .from("courses")
        .insert({
          ...courseData,
          title: `${course.title} (Copy)`,
          status: "draft",
          enrollment_count: 0,
          rating: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast.success("Course duplicated successfully");
    },
    onError: (error) => {
      toast.error("Failed to duplicate course: " + error.message);
    },
  });

  return {
    courses,
    isLoading,
    error,
    createCourse,
    updateCourse,
    deleteCourse,
    duplicateCourse,
  };
}