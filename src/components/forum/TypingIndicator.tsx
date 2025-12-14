import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  users: { id: string; name: string }[];
  className?: string;
}

export function TypingIndicator({ users, className }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const getText = () => {
    if (users.length === 1) {
      return `${users[0].name} is typing...`;
    }
    if (users.length === 2) {
      return `${users[0].name} and ${users[1].name} are typing...`;
    }
    return `${users.length} people are typing...`;
  };

  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      <span>{getText()}</span>
    </div>
  );
}
