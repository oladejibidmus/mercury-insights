import { cn } from "@/lib/utils";

type FilterOption = "7d" | "30d" | "all";

interface DateFilterProps {
  value: FilterOption;
  onChange: (value: FilterOption) => void;
}

const options: { value: FilterOption; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
];

export function DateFilter({ value, onChange }: DateFilterProps) {
  return (
    <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "ripple px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
            value === option.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
