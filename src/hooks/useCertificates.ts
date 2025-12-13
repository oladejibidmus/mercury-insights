import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  credential_id: string;
  issued_at: string;
  course?: {
    title: string;
    instructor: string;
    thumbnail: string | null;
  };
}

export function useCertificates() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["certificates", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("certificates")
        .select(`
          *,
          course:courses(title, instructor, thumbnail)
        `)
        .eq("user_id", user.id)
        .order("issued_at", { ascending: false });

      if (error) throw error;
      return data as Certificate[];
    },
    enabled: !!user,
  });
}

export function useUserProgress() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-progress-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const [enrollmentsRes, progressRes, attemptsRes, certificatesRes] = await Promise.all([
        supabase.from("enrollments").select("id").eq("user_id", user.id),
        supabase.from("course_progress").select("progress_percentage").eq("user_id", user.id),
        supabase.from("quiz_attempts").select("score").eq("user_id", user.id),
        supabase.from("certificates").select("id").eq("user_id", user.id),
      ]);

      const totalEnrolled = enrollmentsRes.data?.length || 0;
      const completedCourses = progressRes.data?.filter(p => Number(p.progress_percentage) >= 100).length || 0;
      const avgQuizScore = attemptsRes.data?.length 
        ? Math.round(attemptsRes.data.reduce((acc, a) => acc + a.score, 0) / attemptsRes.data.length)
        : 0;
      const totalCertificates = certificatesRes.data?.length || 0;

      // Calculate total hours (estimate based on progress)
      const totalProgress = progressRes.data?.reduce((acc, p) => acc + Number(p.progress_percentage), 0) || 0;
      const estimatedHours = Math.round(totalProgress / 10);

      return {
        totalEnrolled,
        completedCourses,
        avgQuizScore,
        totalCertificates,
        estimatedHours,
      };
    },
    enabled: !!user,
  });
}
