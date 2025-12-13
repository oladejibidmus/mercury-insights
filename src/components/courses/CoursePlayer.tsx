import { useState } from "react";
import { X, ChevronLeft, ChevronRight, CheckCircle, PlayCircle, FileText, HelpCircle, BookOpen, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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

interface CoursePlayerProps {
  courseId: string;
  courseTitle: string;
  instructor: string;
  modules: Module[];
  currentLessonId: string;
  progress: number;
  onClose: () => void;
  onLessonComplete: (lessonId: string, lessonIndex: number) => Promise<void>;
  onNavigate: (lessonId: string) => void;
}

export function CoursePlayer({
  courseTitle,
  instructor,
  modules,
  currentLessonId,
  progress,
  onClose,
  onLessonComplete,
  onNavigate,
}: CoursePlayerProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Find current lesson
  const allLessons = modules.flatMap((m) => m.lessons);
  const currentLessonIndex = allLessons.findIndex((l) => l.id === currentLessonId);
  const currentLesson = allLessons[currentLessonIndex];
  const currentModule = modules.find((m) => m.lessons.some((l) => l.id === currentLessonId));

  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  const handleMarkComplete = async () => {
    if (!currentLesson || currentLesson.completed) return;
    setIsCompleting(true);
    await onLessonComplete(currentLesson.id, currentLesson.lessonIndex);
    setIsCompleting(false);
    // Auto-navigate to next lesson
    if (nextLesson) {
      onNavigate(nextLesson.id);
    }
  };

  const getLessonIcon = (type: string, completed: boolean) => {
    if (completed) return <CheckCircle className="w-4 h-4 text-primary" />;
    switch (type) {
      case "video":
        return <PlayCircle className="w-4 h-4" />;
      case "quiz":
        return <HelpCircle className="w-4 h-4" />;
      case "reading":
        return <FileText className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getVideoContent = (lessonType: string, lessonTitle: string) => {
    if (lessonType === "video") {
      return (
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title={lessonTitle}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    if (lessonType === "reading") {
      return (
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center p-8 max-w-2xl">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-4">{lessonTitle}</h3>
            <p className="text-muted-foreground leading-relaxed">
              This is a reading lesson. In a real application, this would contain the lesson content, 
              documentation, code examples, and other learning materials. The content would be rich text 
              with proper formatting, images, and interactive elements.
            </p>
          </div>
        </div>
      );
    }

    if (lessonType === "quiz") {
      return (
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center p-8 max-w-2xl">
            <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-4">{lessonTitle}</h3>
            <p className="text-muted-foreground mb-6">
              Test your knowledge with this quiz. Answer questions to reinforce what you've learned.
            </p>
            <Button>Start Quiz</Button>
          </div>
        </div>
      );
    }

    return null;
  };

  if (!currentLesson || !currentModule) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold text-foreground line-clamp-1">{courseTitle}</h1>
            <p className="text-xs text-muted-foreground">{instructor}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Progress:</span>
            <Progress value={progress} className="w-32 h-2" />
            <span className="font-medium">{progress}%</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex"
          >
            {sidebarOpen ? "Hide" : "Show"} Curriculum
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-4 md:p-6 max-w-5xl mx-auto">
              {/* Video/Content Player */}
              {getVideoContent(currentLesson.type, currentLesson.title)}

              {/* Lesson Info */}
              <div className="mt-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{currentModule.title}</p>
                    <h2 className="text-2xl font-bold text-foreground">{currentLesson.title}</h2>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                    <Clock className="w-4 h-4" />
                    <span>{currentLesson.duration}</span>
                  </div>
                </div>

                {/* Lesson Description */}
                <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
                  <p className="text-muted-foreground">
                    In this {currentLesson.type === "video" ? "video lesson" : currentLesson.type === "reading" ? "reading" : "quiz"}, 
                    you'll learn the key concepts and techniques covered in {currentLesson.title}. 
                    Take your time to understand the material before moving on to the next lesson.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-4 py-4 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => prevLesson && onNavigate(prevLesson.id)}
                    disabled={!prevLesson}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-3">
                    {currentLesson.completed ? (
                      <div className="flex items-center gap-2 text-primary">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Completed</span>
                      </div>
                    ) : (
                      <Button onClick={handleMarkComplete} disabled={isCompleting}>
                        {isCompleting ? "Saving..." : "Mark as Complete"}
                      </Button>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => nextLesson && onNavigate(nextLesson.id)}
                    disabled={!nextLesson}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </main>

        {/* Sidebar - Curriculum */}
        {sidebarOpen && (
          <aside className="w-80 border-l border-border bg-card hidden lg:flex flex-col shrink-0">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Course Curriculum</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {allLessons.filter((l) => l.completed).length} of {allLessons.length} lessons completed
              </p>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2">
                {modules.map((module) => (
                  <div key={module.id} className="mb-4">
                    <div className="flex items-center gap-2 px-3 py-2">
                      {module.completed ? (
                        <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                      ) : (
                        <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="text-sm font-medium text-foreground">{module.title}</span>
                    </div>
                    <ul className="space-y-1 ml-2">
                      {module.lessons.map((lesson) => (
                        <li key={lesson.id}>
                          <button
                            onClick={() => onNavigate(lesson.id)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                              lesson.id === currentLessonId
                                ? "bg-primary/10 text-primary"
                                : lesson.completed
                                ? "text-muted-foreground hover:bg-muted/50"
                                : "text-foreground hover:bg-muted/50"
                            )}
                          >
                            {getLessonIcon(lesson.type, lesson.completed)}
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-sm truncate",
                                lesson.completed && lesson.id !== currentLessonId && "line-through"
                              )}>
                                {lesson.title}
                              </p>
                              <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </aside>
        )}
      </div>
    </div>
  );
}
