import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CoursePlayer } from "@/components/courses/CoursePlayer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface Module {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "reading" | "quiz";
  completed: boolean;
  lessonIndex: number;
  videoUrl?: string;
  content?: string;
}

const CoursePlayerPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<{ title: string; instructor: string } | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentLessonId, setCurrentLessonId] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!courseId || !user) return;

    const fetchCourseData = async () => {
      setIsLoading(true);

      // Fetch course details
      const { data: courseData } = await supabase
        .from("courses")
        .select("title, instructor")
        .eq("id", courseId)
        .single();

      if (!courseData) {
        toast.error("Course not found");
        navigate("/learning-path");
        return;
      }

      setCourse(courseData);

      // Fetch modules and lessons
      const { data: modulesData } = await supabase
        .from("course_modules")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");

      if (!modulesData || modulesData.length === 0) {
        setModules([]);
        setIsLoading(false);
        return;
      }

      const moduleIds = modulesData.map((m) => m.id);
      const { data: lessonsData } = await supabase
        .from("course_lessons")
        .select("*")
        .in("module_id", moduleIds)
        .order("order_index");

      // Fetch user progress
      const { data: progressData } = await supabase
        .from("course_progress")
        .select("*")
        .eq("course_id", courseId)
        .eq("user_id", user.id)
        .single();

      const completedModuleIndices = new Set(progressData?.completed_modules || []);
      
      // Build modules with lessons
      let lessonIndex = 0;
      const builtModules: Module[] = modulesData.map((module, moduleIdx) => {
        const moduleLessons = (lessonsData || [])
          .filter((l) => l.module_id === module.id)
          .map((lesson) => {
            const isCompleted = completedModuleIndices.has(lessonIndex);
            const lessonObj: Lesson = {
              id: lesson.id,
              title: lesson.title,
              duration: lesson.duration || "5 min",
              type: lesson.type as "video" | "reading" | "quiz",
              completed: isCompleted,
              lessonIndex: lessonIndex,
              videoUrl: lesson.video_url || undefined,
              content: lesson.content || undefined,
            };
            if (isCompleted) {
              setCompletedLessons((prev) => new Set(prev).add(lesson.id));
            }
            lessonIndex++;
            return lessonObj;
          });

        return {
          id: module.id,
          title: module.title,
          duration: moduleLessons.reduce((acc, l) => acc + parseInt(l.duration) || 0, 0) + " min",
          completed: moduleLessons.every((l) => l.completed),
          lessons: moduleLessons,
        };
      });

      setModules(builtModules);

      // Set initial lesson - first incomplete or first lesson
      const allLessons = builtModules.flatMap((m) => m.lessons);
      const firstIncomplete = allLessons.find((l) => !l.completed);
      setCurrentLessonId(firstIncomplete?.id || allLessons[0]?.id || "");

      // Calculate progress
      const totalLessons = allLessons.length;
      const completedCount = allLessons.filter((l) => l.completed).length;
      setProgress(totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0);

      setIsLoading(false);
    };

    fetchCourseData();
  }, [courseId, user, navigate]);

  const handleLessonComplete = async (lessonId: string, lessonIndex: number) => {
    if (!user || !courseId) return;

    // Update local state
    setCompletedLessons((prev) => new Set(prev).add(lessonId));
    
    setModules((prevModules) =>
      prevModules.map((module) => ({
        ...module,
        lessons: module.lessons.map((lesson) =>
          lesson.id === lessonId ? { ...lesson, completed: true } : lesson
        ),
        completed: module.lessons.every((l) =>
          l.id === lessonId ? true : l.completed
        ),
      }))
    );

    // Calculate new progress
    const allLessons = modules.flatMap((m) => m.lessons);
    const newCompletedCount = allLessons.filter((l) => l.completed || l.id === lessonId).length;
    const newProgress = Math.round((newCompletedCount / allLessons.length) * 100);
    setProgress(newProgress);

    // Update database
    const { data: existing } = await supabase
      .from("course_progress")
      .select("*")
      .eq("course_id", courseId)
      .eq("user_id", user.id)
      .single();

    const newCompletedModules = [...(existing?.completed_modules || []), lessonIndex];

    if (existing) {
      await supabase
        .from("course_progress")
        .update({
          completed_modules: newCompletedModules,
          progress_percentage: newProgress,
          last_accessed_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("course_progress").insert({
        course_id: courseId,
        user_id: user.id,
        completed_modules: newCompletedModules,
        progress_percentage: newProgress,
      });
    }

    toast.success("Lesson completed!");
  };

  const handleNavigate = (lessonId: string) => {
    setCurrentLessonId(lessonId);
  };

  const handleClose = () => {
    navigate("/learning-path");
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Sign in to access course</h2>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course || modules.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">No content available</h2>
          <p className="text-muted-foreground mb-4">This course doesn't have any lessons yet.</p>
          <Button onClick={() => navigate("/learning-path")}>Back to Learning Path</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <CoursePlayer
      courseId={courseId!}
      courseTitle={course.title}
      instructor={course.instructor}
      modules={modules}
      currentLessonId={currentLessonId}
      progress={progress}
      onClose={handleClose}
      onLessonComplete={handleLessonComplete}
      onNavigate={handleNavigate}
    />
  );
};

export default CoursePlayerPage;
