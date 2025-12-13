import { X, Star, Clock, Users, BookOpen, User } from "lucide-react";
import { Course } from "@/data/courses";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CoursePreviewModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
}

const levelColors = {
  Beginner: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Intermediate: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Advanced: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export function CoursePreviewModal({ course, isOpen, onClose }: CoursePreviewModalProps) {
  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-fade-in-up mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="overflow-y-auto max-h-[90vh]">
          {/* Header Image */}
          <div className="relative aspect-video">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            <div className={cn(
              "absolute top-4 left-4 px-3 py-1.5 rounded-full text-sm font-medium",
              levelColors[course.level]
            )}>
              {course.level}
            </div>
          </div>

          <div className="p-6 -mt-12 relative">
            {/* Title & Meta */}
            <h2 className="text-2xl font-bold text-foreground mb-2">{course.title}</h2>
            <p className="text-muted-foreground mb-4">by {course.instructor}</p>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-foreground">{course.rating}</span>
                <span className="text-muted-foreground">({course.reviewCount.toLocaleString()} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{course.enrollmentCount.toLocaleString()} enrolled</span>
              </div>
            </div>

            {/* Overview */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Overview
              </h3>
              <p className="text-muted-foreground leading-relaxed">{course.description}</p>
            </div>

            {/* Curriculum */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Curriculum</h3>
              <div className="space-y-2">
                {course.curriculum.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-sm text-foreground">{item.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.duration}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructor */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                About the Instructor
              </h3>
              <p className="text-muted-foreground">{course.instructorBio}</p>
            </div>

            {/* Reviews */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Student Reviews</h3>
              <div className="space-y-3">
                {course.reviews.map((review, index) => (
                  <div key={index} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-foreground">{review.user}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-3.5 h-3.5",
                              i < review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Enroll Button */}
            <Button className="w-full h-12 text-base font-semibold">
              Enroll Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
