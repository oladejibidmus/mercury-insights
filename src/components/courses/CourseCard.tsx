import { Star, Clock, Users, Heart } from "lucide-react";
import { Course } from "@/data/courses";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface CourseCardProps {
  course: Course;
  onClick: () => void;
  isEnrolled?: boolean;
  isFavorite?: boolean;
  progress?: number;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

const levelColors = {
  Beginner: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Intermediate: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Advanced: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export function CourseCard({ 
  course, 
  onClick, 
  isEnrolled = false,
  isFavorite = false,
  progress = 0,
  onToggleFavorite 
}: CourseCardProps) {
  return (
    <button
      onClick={onClick}
      className="group bg-card border border-border rounded-xl overflow-hidden text-left transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 w-full"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className={cn(
          "absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium",
          levelColors[course.level]
        )}>
          {course.level}
        </div>
        
        {/* Favorite button */}
        {onToggleFavorite && (
          <button
            onClick={onToggleFavorite}
            className="absolute top-3 right-3 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
          >
            <Heart 
              className={cn(
                "w-4 h-4 transition-colors",
                isFavorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground hover:text-rose-500"
              )} 
            />
          </button>
        )}

        {/* Enrolled badge */}
        {isEnrolled && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/90 text-primary-foreground">
            Enrolled
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-3">{course.instructor}</p>

        {/* Progress bar for enrolled courses */}
        {isEnrolled && progress > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium text-foreground">{course.rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">({course.reviewCount.toLocaleString()} reviews)</span>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{course.enrollmentCount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
