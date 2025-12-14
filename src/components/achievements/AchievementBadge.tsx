import { Achievement } from "@/hooks/useAchievements";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  CheckCircle,
  BookOpen,
  ClipboardCheck,
  Star,
  GraduationCap,
  Users,
  Compass,
  Trophy,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "message-square": MessageSquare,
  "check-circle": CheckCircle,
  "book-open": BookOpen,
  "clipboard-check": ClipboardCheck,
  star: Star,
  "graduation-cap": GraduationCap,
  users: Users,
  compass: Compass,
  trophy: Trophy,
};

interface AchievementBadgeProps {
  achievement: Achievement;
  earned?: boolean;
  earnedAt?: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export function AchievementBadge({
  achievement,
  earned = false,
  earnedAt,
  size = "md",
  showTooltip = true,
}: AchievementBadgeProps) {
  const Icon = iconMap[achievement.icon] || Trophy;

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const badge = (
    <div
      className={cn(
        "rounded-full flex items-center justify-center transition-all",
        sizeClasses[size],
        earned
          ? "bg-primary text-primary-foreground shadow-lg"
          : "bg-muted text-muted-foreground opacity-50"
      )}
    >
      <Icon className={iconSizes[size]} />
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-semibold">{achievement.name}</p>
            <p className="text-xs text-muted-foreground">{achievement.description}</p>
            <p className="text-xs text-primary mt-1">{achievement.points} pts</p>
            {earnedAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Earned {new Date(earnedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
