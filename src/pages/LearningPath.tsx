import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { mockLearningPath, LearningCourse } from "@/data/learningPath";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, PlayCircle, FileText, HelpCircle, MapPin, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterStatus = "all" | "in-progress" | "completed";

const LearningPath = () => {
  const [filter, setFilter] = useState<FilterStatus>("all");

  const filteredCourses = mockLearningPath.filter((course) => {
    if (filter === "all") return true;
    if (filter === "in-progress") return course.status === "in-progress";
    if (filter === "completed") return course.status === "completed";
    return true;
  });

  const totalProgress = Math.round(
    mockLearningPath.reduce((acc, c) => acc + c.progress, 0) / mockLearningPath.length
  );

  const completedCourses = mockLearningPath.filter((c) => c.status === "completed").length;

  return (
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
              {completedCourses} of {mockLearningPath.length} courses completed
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-primary">{totalProgress}%</span>
          </div>
        </div>
        <Progress value={totalProgress} className="h-3" />
        <div className="flex gap-2 mt-4">
          {mockLearningPath.map((course, idx) => (
            <div
              key={course.id}
              className={cn(
                "h-2 flex-1 rounded-full transition-colors",
                course.status === "completed"
                  ? "bg-primary"
                  : course.status === "in-progress"
                  ? "bg-primary/50"
                  : "bg-muted"
              )}
              title={`${course.title}: ${course.progress}%`}
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
          <CoursePathCard key={course.id} course={course} index={courseIdx} />
        ))}
      </div>
    </DashboardLayout>
  );
};

function CoursePathCard({ course, index }: { course: LearningCourse; index: number }) {
  const statusColors = {
    completed: "border-primary bg-primary/5",
    "in-progress": "border-primary/50 bg-card",
    "not-started": "border-border bg-card opacity-75",
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

  return (
    <div className="relative">
      {/* Connector Line */}
      {index > 0 && (
        <div className="absolute left-6 -top-4 w-0.5 h-4 bg-border" />
      )}

      <div
        className={cn(
          "border-2 rounded-xl p-5 transition-all",
          statusColors[course.status]
        )}
      >
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
              {course.status === "completed" ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                index + 1
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">{course.title}</h3>
                {course.isCurrentPosition && (
                  <Badge variant="default" className="gap-1">
                    <MapPin className="w-3 h-3" /> You are here
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span>{course.modules.length} modules</span>
                <span>•</span>
                <span>
                  {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons
                </span>
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

        {/* Progress Bar */}
        <Progress value={course.progress} className="h-2 mb-4" />

        {/* Modules Accordion */}
        <Accordion type="multiple" className="space-y-2">
          {course.modules.map((module) => (
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
                    <span className="text-sm text-muted-foreground ml-2">
                      ({module.duration})
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pt-2 pb-1">
                  {module.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg transition-colors",
                        lesson.completed
                          ? "bg-primary/5"
                          : "hover:bg-muted/50 cursor-pointer"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {getLessonIcon(lesson.type, lesson.completed)}
                        <span
                          className={cn(
                            "text-sm",
                            lesson.completed
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          )}
                        >
                          {lesson.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {lesson.duration}
                        </span>
                        {!lesson.completed && (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Next Step CTA */}
        {course.status === "in-progress" && (
          <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Next Up</p>
                <p className="text-sm text-muted-foreground">
                  {course.modules
                    .flatMap((m) => m.lessons)
                    .find((l) => !l.completed)?.title || "Complete remaining lessons"}
                </p>
              </div>
              <Button size="sm">
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LearningPath;
