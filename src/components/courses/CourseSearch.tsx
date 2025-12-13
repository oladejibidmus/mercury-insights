import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { mockCourses } from "@/data/courses";
import { cn } from "@/lib/utils";

interface CourseSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function CourseSearch({ value, onChange }: CourseSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = value.length > 0
    ? mockCourses
        .filter(course =>
          course.title.toLowerCase().includes(value.toLowerCase()) ||
          course.instructor.toLowerCase().includes(value.toLowerCase()) ||
          course.category.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search courses, instructors..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(true);
          }}
          onBlur={() => setIsFocused(false)}
          className="pl-9 pr-9 h-10 bg-background"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {suggestions.map((course) => (
            <button
              key={course.id}
              onClick={() => {
                onChange(course.title);
                setShowSuggestions(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3"
            >
              <img
                src={course.thumbnail}
                alt=""
                className="w-10 h-10 rounded object-cover flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{course.title}</p>
                <p className="text-xs text-muted-foreground">{course.instructor} • {course.category}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
