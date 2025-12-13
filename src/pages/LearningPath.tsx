import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { mockCourses, Course } from "@/data/courses";
import { useCourseActions } from "@/hooks/useCourseActions";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CoursePlayer } from "@/components/courses/CoursePlayer";
import { CheckCircle, Circle, PlayCircle, FileText, HelpCircle, MapPin, ChevronRight, BookOpen, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type FilterStatus = "all" | "in-progress" | "completed";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "reading" | "quiz";
  completed: boolean;
  lessonIndex: number;
}

interface Module {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  lessons: Lesson[];
}

interface PlayerState {
  courseId: string;
  courseTitle: string;
  instructor: string;
  modules: Module[];
  currentLessonId: string;
  progress: number;
}

const LearningPath = () => {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { enrolledCourses, getProgress, loading, updateProgress } = useCourseActions();

  // Get enrolled courses with their progress
  const enrolledCoursesData = mockCourses
    .filter((course) => enrolledCourses.includes(course.id))
    .map((course) => {
      const progress = getProgress(course.id);
      let status: "completed" | "in-progress" | "not-started" = "not-started";
      if (progress >= 100) status = "completed";
      else if (progress > 0) status = "in-progress";
      return { ...course, progress, status };
    });

  const filteredCourses = enrolledCoursesData.filter((course) => {
    if (filter === "all") return true;
    if (filter === "in-progress") return course.status === "in-progress";
    if (filter === "completed") return course.status === "completed";
    return true;
  });

  const totalProgress = enrolledCoursesData.length > 0
    ? Math.round(enrolledCoursesData.reduce((acc, c) => acc + c.progress, 0) / enrolledCoursesData.length)
    : 0;

  const completedCourses = enrolledCoursesData.filter((c) => c.status === "completed").length;

  const generateModules = (course: Course, progress: number): Module[] => {
    const totalLessons = course.curriculum.length * 3;
    const completedLessonCount = Math.floor((progress / 100) * totalLessons);

    return course.curriculum.map((item, idx) => {
      const lessonStartIndex = idx * 3;
      return {
        id: `module-${course.id}-${idx}`,
        title: item.title,
        duration: item.duration,
        completed: completedLessonCount >= (idx + 1) * 3,
        lessons: [
          {
            id: `lesson-${course.id}-${idx}-1`,
            title: `${item.title} - Introduction`,
            duration: "10 min",
            type: "video" as const,
            completed: completedLessonCount > lessonStartIndex,
            lessonIndex: lessonStartIndex,
          },
          {
            id: `lesson-${course.id}-${idx}-2`,
            title: `${item.title} - Practice`,
            duration: "20 min",
            type: "reading" as const,
            completed: completedLessonCount > lessonStartIndex + 1,
            lessonIndex: lessonStartIndex + 1,
          },
          {
            id: `lesson-${course.id}-${idx}-3`,
            title: `${item.title} - Quiz`,
            duration: "15 min",
            type: "quiz" as const,
            completed: completedLessonCount > lessonStartIndex + 2,
            lessonIndex: lessonStartIndex + 2,
          },
        ],
      };
    });
  };

  const openCoursePlayer = (course: EnrolledCourse, lessonId?: string) => {
    const modules = generateModules(course, course.progress);
    const allLessons = modules.flatMap((m) => m.lessons);
    
    // Find the first incomplete lesson or use provided lessonId
    let targetLessonId = lessonId;
    if (!targetLessonId) {
      const nextLesson = allLessons.find((l) => !l.completed);
      targetLessonId = nextLesson?.id || allLessons[0]?.id;
    }

    setPlayerState({
      courseId: course.id,
      courseTitle: course.title,
      instructor: course.instructor,
      modules,
      currentLessonId: targetLessonId,
      progress: course.progress,
    });
  };

  const handleLessonCompleteInPlayer = async (lessonId: string, lessonIndex: number) => {
    if (!playerState) return;

    const course = enrolledCoursesData.find((c) => c.id === playerState.courseId);
    if (!course) return;

    const totalLessons = course.curriculum.length * 3;
    const newCompletedCount = lessonIndex + 1;
    const newProgress = Math.round((newCompletedCount / totalLessons) * 100);

    const success = await updateProgress(playerState.courseId, Math.min(newProgress, 100));

    if (success) {
      toast.success("Lesson completed!");
      // Update player state with new progress
      const updatedModules = generateModules(course, Math.min(newProgress, 100));
      setPlayerState((prev) =>
        prev
          ? {
              ...prev,
              progress: Math.min(newProgress, 100),
              modules: updatedModules,
            }
          : null
      );
    }
  };

  const handleNavigateInPlayer = (lessonId: string) => {
    setPlayerState((prev) => (prev ? { ...prev, currentLessonId: lessonId } : null));
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Sign in to view your learning path</h2>
          <p className="text-muted-foreground mb-6">Track your progress and continue learning</p>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (enrolledCoursesData.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">No courses enrolled yet</h2>
          <p className="text-muted-foreground mb-6">Start your learning journey by exploring our courses</p>
          <Button onClick={() => navigate("/explore-courses")}>Explore Courses</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Learning Path</h1>
          <p className="text-muted-foreground">Track your personalized learning journey</p>
        </div>

        {/* Overall Progress */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Overall Progress</h3>
              <p className="text-sm text-muted-foreground">
                {completedCourses} of {enrolledCoursesData.length} courses completed
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary">{totalProgress}%</span>
            </div>
          </div>
          <Progress value={totalProgress} className="h-3" />
          <div className="flex gap-2 mt-4">
            {enrolledCoursesData.map((course) => (
              <div
                key={course.id}
                className={cn(
                  "h-2 flex-1 rounded-full transition-colors cursor-pointer hover:opacity-80",
                  course.status === "completed"
                    ? "bg-primary"
                    : course.status === "in-progress"
                    ? "bg-primary/50"
                    : "bg-muted"
                )}
                title={`${course.title}: ${course.progress}%`}
                onClick={() => openCoursePlayer(course)}
              />
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { value: "all", label: "Show All" },
            { value: "in-progress", label: "In Progress" },
            { value: "completed", label: "Completed" },
          ].map((tab) => (
            <Button
              key={tab.value}
              variant={filter === tab.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(tab.value as FilterStatus)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Learning Path Visual */}
        <div className="space-y-4">
          {filteredCourses.map((course, courseIdx) => (
            <CoursePathCard
              key={course.id}
              course={course}
              index={courseIdx}
              onUpdateProgress={updateProgress}
              onOpenPlayer={(lessonId) => openCoursePlayer(course, lessonId)}
            />
          ))}
        </div>
      </DashboardLayout>

      {/* Course Player Modal */}
      {playerState && (
        <CoursePlayer
          courseId={playerState.courseId}
          courseTitle={playerState.courseTitle}
          instructor={playerState.instructor}
          modules={playerState.modules}
          currentLessonId={playerState.currentLessonId}
          progress={playerState.progress}
          onClose={() => setPlayerState(null)}
          onLessonComplete={handleLessonCompleteInPlayer}
          onNavigate={handleNavigateInPlayer}
        />
      )}
    </>
  );
};

interface EnrolledCourse extends Course {
  progress: number;
  status: "completed" | "in-progress" | "not-started";
}

interface CoursePathCardProps {
  course: EnrolledCourse;
  index: number;
  onUpdateProgress: (courseId: string, percentage: number) => Promise<boolean>;
  onOpenPlayer: (lessonId?: string) => void;
}

function CoursePathCard({ course, index, onUpdateProgress, onOpenPlayer }: CoursePathCardProps) {
  const [loadingLesson, setLoadingLesson] = useState<string | null>(null);

  const statusColors = {
    completed: "border-primary bg-primary/5",
    "in-progress": "border-primary/50 bg-card",
    "not-started": "border-border bg-card opacity-75",
  };

  const totalLessons = course.curriculum.length * 3;
  const completedLessonCount = Math.floor((course.progress / 100) * totalLessons);

  const modules = course.curriculum.map((item, idx) => {
    const lessonStartIndex = idx * 3;
    return {
      id: `module-${course.id}-${idx}`,
      title: item.title,
      duration: item.duration,
      completed: completedLessonCount >= (idx + 1) * 3,
      lessons: [
        {
          id: `lesson-${course.id}-${idx}-1`,
          title: `${item.title} - Introduction`,
          duration: "10 min",
          type: "video" as const,
          completed: completedLessonCount > lessonStartIndex,
          lessonIndex: lessonStartIndex,
        },
        {
          id: `lesson-${course.id}-${idx}-2`,
          title: `${item.title} - Practice`,
          duration: "20 min",
          type: "reading" as const,
          completed: completedLessonCount > lessonStartIndex + 1,
          lessonIndex: lessonStartIndex + 1,
        },
        {
          id: `lesson-${course.id}-${idx}-3`,
          title: `${item.title} - Quiz`,
          duration: "15 min",
          type: "quiz" as const,
          completed: completedLessonCount > lessonStartIndex + 2,
          lessonIndex: lessonStartIndex + 2,
        },
      ],
    };
  });

  const handleStartCourse = async () => {
    if (course.progress === 0) {
      setLoadingLesson("start");
      const success = await onUpdateProgress(course.id, 1);
      if (success) {
        toast.success("Course started!");
        onOpenPlayer();
      }
      setLoadingLesson(null);
    }
  };

  const getLessonIcon = (type: string, completed: boolean) => {
    if (completed) return <CheckCircle className="w-4 h-4 text-primary" />;
    switch (type) {
      case "video":
        return <PlayCircle className="w-4 h-4 text-muted-foreground" />;
      case "quiz":
        return <HelpCircle className="w-4 h-4 text-muted-foreground" />;
      case "reading":
        return <FileText className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const isCurrentPosition = course.status === "in-progress";
  const nextLesson = modules.flatMap((m) => m.lessons).find((l) => !l.completed);

  return (
    <div className="relative">
      {index > 0 && <div className="absolute left-6 -top-4 w-0.5 h-4 bg-border" />}

      <div className={cn("border-2 rounded-xl p-5 transition-all", statusColors[course.status])}>
        {/* Course Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold",
                course.status === "completed"
                  ? "bg-primary text-primary-foreground"
                  : course.status === "in-progress"
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {course.status === "completed" ? <CheckCircle className="w-6 h-6" /> : index + 1}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">{course.title}</h3>
                {isCurrentPosition && (
                  <Badge variant="default" className="gap-1">
                    <MapPin className="w-3 h-3" /> You are here
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span>{course.curriculum.length} modules</span>
                <span>•</span>
                <span>{course.duration}</span>
                <span>•</span>
                <span>{course.instructor}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-foreground">{course.progress}%</span>
            <Badge
              variant={
                course.status === "completed"
                  ? "default"
                  : course.status === "in-progress"
                  ? "secondary"
                  : "outline"
              }
              className="ml-2"
            >
              {course.status === "completed"
                ? "Completed"
                : course.status === "in-progress"
                ? "In Progress"
                : "Not Started"}
            </Badge>
          </div>
        </div>

        <Progress value={course.progress} className="h-2 mb-4" />

        {/* Modules Accordion */}
        <Accordion type="multiple" className="space-y-2">
          {modules.map((module) => (
            <AccordionItem
              key={module.id}
              value={module.id}
              className="border border-border rounded-lg px-4 bg-background/50"
            >
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-3 text-left">
                  {module.completed ? (
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <div>
                    <span className="font-medium">{module.title}</span>
                    <span className="text-sm text-muted-foreground ml-2">({module.duration})</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pt-2 pb-1">
                  {module.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      onClick={() => onOpenPlayer(lesson.id)}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer",
                        lesson.completed ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {getLessonIcon(lesson.type, lesson.completed)}
                        <span
                          className={cn(
                            "text-sm",
                            lesson.completed ? "text-muted-foreground line-through" : "text-foreground"
                          )}
                        >
                          {lesson.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                        <PlayCircle className="w-4 h-4 text-primary" />
                      </div>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* CTAs */}
        {course.status === "not-started" && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Ready to begin?</p>
                <p className="text-sm text-muted-foreground">Start your learning journey</p>
              </div>
              <Button size="sm" onClick={handleStartCourse} disabled={loadingLesson === "start"}>
                {loadingLesson === "start" ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Start Course <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {course.status === "in-progress" && nextLesson && (
          <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Next Up</p>
                <p className="text-sm text-muted-foreground">{nextLesson.title}</p>
              </div>
              <Button size="sm" onClick={() => onOpenPlayer(nextLesson.id)}>
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {course.status === "completed" && (
          <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <p className="text-sm font-medium text-foreground">Course Completed!</p>
              </div>
              <Button size="sm" variant="outline">
                View Certificate
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LearningPath;
