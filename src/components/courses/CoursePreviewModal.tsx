import { X, Star, Clock, Users, BookOpen, User, Heart, Loader2 } from "lucide-react";
import { Course } from "@/data/courses";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface CoursePreviewModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  isEnrolled?: boolean;
  isFavorite?: boolean;
  progress?: number;
  onEnroll?: () => Promise<void>;
  onUnenroll?: () => Promise<void>;
  onToggleFavorite?: () => Promise<void>;
  isLoading?: boolean;
}

const levelColors = {
  Beginner: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Intermediate: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Advanced: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export function CoursePreviewModal({ 
  course, 
  isOpen, 
  onClose,
  isEnrolled = false,
  isFavorite = false,
  progress = 0,
  onEnroll,
  onUnenroll,
  onToggleFavorite,
  isLoading = false,
}: CoursePreviewModalProps) {
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
            
            {/* Favorite button */}
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite()}
                className="absolute top-4 right-14 p-2.5 rounded-full bg-background/80 hover:bg-background transition-colors"
              >
                <Heart 
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isFavorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground hover:text-rose-500"
                  )} 
                />
              </button>
            )}
          </div>

          <div className="p-6 -mt-12 relative">
            {/* Title & Meta */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <h2 className="text-2xl font-bold text-foreground">{course.title}</h2>
              {isEnrolled && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary shrink-0">
                  Enrolled
                </span>
              )}
            </div>
            <p className="text-muted-foreground mb-4">by {course.instructor}</p>

            {/* Progress for enrolled courses */}
            {isEnrolled && (
              <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Your Progress</span>
                  <span className="font-medium text-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

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

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isEnrolled ? (
                <>
                  <Button className="flex-1 h-12 text-base font-semibold">
                    Continue Learning
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-12"
                    onClick={onUnenroll}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Unenroll"}
                  </Button>
                </>
              ) : (
                <Button 
                  className="w-full h-12 text-base font-semibold"
                  onClick={onEnroll}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Enroll Now
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
