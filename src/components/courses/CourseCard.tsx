import { Star, Clock, Users } from "lucide-react";
import { Course } from "@/data/courses";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  course: Course;
  onClick: () => void;
}

const levelColors = {
  Beginner: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Intermediate: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Advanced: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export function CourseCard({ course, onClick }: CourseCardProps) {
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
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-3">{course.instructor}</p>

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
