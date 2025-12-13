import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DBCourse {
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

export interface CourseWithModules extends DBCourse {
  course_modules: {
    id: string;
    title: string;
    description: string | null;
    order_index: number;
    course_lessons: {
      id: string;
      title: string;
      type: string;
      duration: string | null;
      video_url: string | null;
      content: string | null;
      order_index: number;
    }[];
  }[];
}

export function useCourses() {
  return useQuery({
    queryKey: ["published-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DBCourse[];
    },
  });
}

export function useCourseWithModules(courseId: string | null) {
  return useQuery({
    queryKey: ["course-with-modules", courseId],
    queryFn: async () => {
      if (!courseId) return null;

      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          course_modules (
            id,
            title,
            description,
            order_index,
            course_lessons (
              id,
              title,
              type,
              duration,
              video_url,
              content,
              order_index
            )
          )
        `)
        .eq("id", courseId)
        .single();

      if (error) throw error;

      // Sort modules and lessons by order_index
      if (data?.course_modules) {
        data.course_modules.sort((a: any, b: any) => a.order_index - b.order_index);
        data.course_modules.forEach((module: any) => {
          if (module.course_lessons) {
            module.course_lessons.sort((a: any, b: any) => a.order_index - b.order_index);
          }
        });
      }

      return data as CourseWithModules;
    },
    enabled: !!courseId,
  });
}
