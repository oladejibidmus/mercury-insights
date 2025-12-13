import { SlidersHorizontal } from "lucide-react";
import { categories, levels, durations, ratings } from "@/data/courses";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CourseFiltersProps {
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  selectedLevel: string;
  setSelectedLevel: (v: string) => void;
  selectedDuration: string;
  setSelectedDuration: (v: string) => void;
  selectedRating: string;
  setSelectedRating: (v: string) => void;
  onClearFilters: () => void;
}

export function CourseFilters({
  selectedCategory,
  setSelectedCategory,
  selectedLevel,
  setSelectedLevel,
  selectedDuration,
  setSelectedDuration,
  selectedRating,
  setSelectedRating,
  onClearFilters,
}: CourseFiltersProps) {
  const hasActiveFilters = selectedCategory !== "All" || selectedLevel !== "All" || selectedDuration !== "All" || selectedRating !== "All";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <SlidersHorizontal className="w-4 h-4" />
        <span className="text-sm font-medium">Filters:</span>
      </div>

      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
        <SelectTrigger className="w-[140px] h-9 bg-background">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedLevel} onValueChange={setSelectedLevel}>
        <SelectTrigger className="w-[140px] h-9 bg-background">
          <SelectValue placeholder="Level" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {levels.map((level) => (
            <SelectItem key={level} value={level}>{level === "All" ? "All Levels" : level}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedDuration} onValueChange={setSelectedDuration}>
        <SelectTrigger className="w-[140px] h-9 bg-background">
          <SelectValue placeholder="Duration" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {durations.map((dur) => (
            <SelectItem key={dur} value={dur}>{dur === "All" ? "All Durations" : dur}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedRating} onValueChange={setSelectedRating}>
        <SelectTrigger className="w-[120px] h-9 bg-background">
          <SelectValue placeholder="Rating" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {ratings.map((rating) => (
            <SelectItem key={rating} value={rating}>{rating === "All" ? "All Ratings" : rating}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="text-sm text-primary hover:underline ml-2"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
