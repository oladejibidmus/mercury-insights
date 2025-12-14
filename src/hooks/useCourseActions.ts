import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useCourseActions() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [favoriteCourses, setFavoriteCourses] = useState<string[]>([]);
  const [courseProgress, setCourseProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    if (!user) {
      setEnrolledCourses([]);
      setFavoriteCourses([]);
      setCourseProgress({});
      setLoading(false);
      return;
    }

    setLoading(true);

    const [enrollmentsRes, favoritesRes, progressRes] = await Promise.all([
      supabase.from("enrollments").select("course_id").eq("user_id", user.id),
      supabase.from("favorites").select("course_id").eq("user_id", user.id),
      supabase.from("course_progress").select("course_id, progress_percentage").eq("user_id", user.id),
    ]);

    if (enrollmentsRes.data) {
      setEnrolledCourses(enrollmentsRes.data.map((e) => e.course_id));
    }
    if (favoritesRes.data) {
      setFavoriteCourses(favoritesRes.data.map((f) => f.course_id));
    }
    if (progressRes.data) {
      const progressMap: Record<string, number> = {};
      progressRes.data.forEach((p) => {
        progressMap[p.course_id] = Number(p.progress_percentage);
      });
      setCourseProgress(progressMap);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const enrollInCourse = async (courseId: string) => {
    if (!user) {
      toast.error("Please sign in to enroll");
      return false;
    }

    const { error } = await supabase.from("enrollments").insert({
      user_id: user.id,
      course_id: courseId,
    });

    if (error) {
      if (error.code === "23505") {
        toast.info("Already enrolled in this course");
      } else {
        toast.error("Failed to enroll");
      }
      return false;
    }

    // Increment enrollment count on the course
    const { data: courseData } = await supabase
      .from("courses")
      .select("enrollment_count")
      .eq("id", courseId)
      .single();

    if (courseData) {
      await supabase
        .from("courses")
        .update({ enrollment_count: (courseData.enrollment_count || 0) + 1 })
        .eq("id", courseId);
    }

    setEnrolledCourses((prev) => [...prev, courseId]);
    toast.success("Enrolled successfully!");
    return true;
  };

  const unenrollFromCourse = async (courseId: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from("enrollments")
      .delete()
      .eq("user_id", user.id)
      .eq("course_id", courseId);

    if (error) {
      toast.error("Failed to unenroll");
      return false;
    }

    setEnrolledCourses((prev) => prev.filter((id) => id !== courseId));
    toast.success("Unenrolled successfully");
    return true;
  };

  const toggleFavorite = async (courseId: string) => {
    if (!user) {
      toast.error("Please sign in to save favorites");
      return false;
    }

    const isFavorite = favoriteCourses.includes(courseId);

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("course_id", courseId);

      if (error) {
        toast.error("Failed to remove from favorites");
        return false;
      }

      setFavoriteCourses((prev) => prev.filter((id) => id !== courseId));
      toast.success("Removed from favorites");
    } else {
      const { error } = await supabase.from("favorites").insert({
        user_id: user.id,
        course_id: courseId,
      });

      if (error) {
        toast.error("Failed to add to favorites");
        return false;
      }

      setFavoriteCourses((prev) => [...prev, courseId]);
      toast.success("Added to favorites");
    }

    return true;
  };

  const updateProgress = async (courseId: string, percentage: number) => {
    if (!user) return false;

    const { error } = await supabase
      .from("course_progress")
      .upsert({
        user_id: user.id,
        course_id: courseId,
        progress_percentage: percentage,
        last_accessed_at: new Date().toISOString(),
      }, { onConflict: "user_id,course_id" });

    if (error) {
      toast.error("Failed to update progress");
      return false;
    }

    setCourseProgress((prev) => ({ ...prev, [courseId]: percentage }));
    return true;
  };

  return {
    enrolledCourses,
    favoriteCourses,
    courseProgress,
    loading,
    enrollInCourse,
    unenrollFromCourse,
    toggleFavorite,
    updateProgress,
    isEnrolled: (courseId: string) => enrolledCourses.includes(courseId),
    isFavorite: (courseId: string) => favoriteCourses.includes(courseId),
    getProgress: (courseId: string) => courseProgress[courseId] || 0,
  };
}
