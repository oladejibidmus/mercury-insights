import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { mockCourses, categories, levels, durations, ratings } from "@/data/courses";
import { cn } from "@/lib/utils";

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

function FilterSection({ title, options, selected, onSelect }: {
  title: string;
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-foreground mb-3">{title}</h3>
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onSelect(option)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
              selected === option
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
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
    <aside className="w-64 flex-shrink-0 bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Filters</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <FilterSection
        title="Category"
        options={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <FilterSection
        title="Level"
        options={levels}
        selected={selectedLevel}
        onSelect={setSelectedLevel}
      />

      <FilterSection
        title="Duration"
        options={durations}
        selected={selectedDuration}
        onSelect={setSelectedDuration}
      />

      <FilterSection
        title="Rating"
        options={ratings}
        selected={selectedRating}
        onSelect={setSelectedRating}
      />
    </aside>
  );
}
